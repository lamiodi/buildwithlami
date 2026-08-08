import pool from '../config/db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

export const getQuotations = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT q.*, 
                   l.full_name as lead_name, 
                   l.email as lead_email,
                   c.name as client_name
            FROM quotations q
            LEFT JOIN leads l ON q.lead_id = l.id
            LEFT JOIN clients c ON q.client_id = c.id
            ORDER BY q.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('[Quotations] getQuotations error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getQuotationById = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });
    
    try {
        const { rows } = await pool.query(`
            SELECT q.*, 
                   l.full_name as lead_name, 
                   l.email as lead_email,
                   c.name as client_name
            FROM quotations q
            LEFT JOIN leads l ON q.lead_id = l.id
            LEFT JOIN clients c ON q.client_id = c.id
            WHERE q.id = $1
        `, [id]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('[Quotations] getQuotationById error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createQuotation = async (req, res) => {
    const { lead_id, client_id, title, amount, line_items, notes, valid_until } = req.body;
    
    try {
        const { rows } = await pool.query(`
            INSERT INTO quotations (lead_id, client_id, title, amount, line_items, notes, valid_until, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT')
            RETURNING *
        `, [
            isUuid(lead_id) ? lead_id : null,
            isUuid(client_id) ? client_id : null,
            title || 'Standard Quotation',
            amount || 0,
            JSON.stringify(line_items || []),
            notes || '',
            valid_until || null
        ]);
        
        // Auto-update lead stage if applicable
        if (isUuid(lead_id)) {
            await pool.query(`UPDATE leads SET stage = 'PROPOSAL', updated_at = NOW() WHERE id = $1`, [lead_id]);
        }
        
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('[Quotations] createQuotation error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateQuotationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });
    if (!['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    try {
        const { rows } = await pool.query(`
            UPDATE quotations 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING *
        `, [status, id]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
        
        res.json(rows[0]);
    } catch (err) {
        console.error('[Quotations] updateQuotationStatus error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const convertQuotationToContract = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });
    
    try {
        // Fetch quotation
        const { rows: qRows } = await pool.query('SELECT * FROM quotations WHERE id = $1', [id]);
        if (qRows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
        
        const quotation = qRows[0];
        if (quotation.status !== 'ACCEPTED') {
            return res.status(400).json({ error: 'Quotation must be ACCEPTED to convert to a contract.' });
        }
        
        // In a real app, here we would call Zoho Sign or Docusign. 
        // For Agency OS, we just create a contract record.
        const { rows: cRows } = await pool.query(`
            INSERT INTO contracts (client_id, quotation_id, contract_type, status, value, sent_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
        `, [
            quotation.client_id, 
            quotation.id, 
            'PROJECT_AGREEMENT', 
            'SENT', 
            quotation.amount
        ]);
        
        // Mark quotation as converted
        await pool.query(`UPDATE quotations SET status = 'CONVERTED', updated_at = NOW() WHERE id = $1`, [id]);
        
        res.json({ message: 'Successfully converted to Contract', contract: cRows[0] });
    } catch (err) {
        console.error('[Quotations] convertQuotationToContract error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Keep temporary editor identities out of stored invoice and portfolio data.
export function withoutEditorKey(row) {
    const value = { ...row };
    delete value._key;
    return value;
}

const WorkspaceSelector = ({ activeId, onChange, options }) => (
    <label className="block rounded-xl bg-accent/5 border border-accent/20 p-3">
        <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Workspace</span>
        <select aria-label="Switch workspace" value={activeId} onChange={(event) => onChange(event.target.value)}
            className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-white rounded-lg p-1 focus-visible:outline-accent">
            {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
    </label>
);
export default WorkspaceSelector;

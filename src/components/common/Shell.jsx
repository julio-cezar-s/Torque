import { Wrench, LogOut } from "lucide-react";

export function Shell({ brandSub, navItems, tab, setTab, onLogout, children }) {
  return (
    <div className="wf-root">
      <aside className="wf-sidebar">
        <div className="wf-brand">
          <Wrench size={22} />
          <div><span className="wf-brand__title">Torque</span><span className="wf-brand__sub">{brandSub}</span></div>
        </div>
        <nav className="wf-nav">
          {navItems.map((n) => (
            <button key={n.key} className={`wf-nav__item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
              <n.icon size={18} /><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="wf-sidebar__foot">
          <button className="wf-nav__item" onClick={onLogout}><LogOut size={18} /><span>Sair</span></button>
        </div>
      </aside>
      <main className="wf-main">{children}</main>
      <nav className="wf-mobilenav">
        {navItems.map((n) => (
          <button key={n.key} className={`wf-mobilenav__item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
            <n.icon size={18} /><span>{n.label.split(" ")[0]}</span>
          </button>
        ))}
        <button className="wf-mobilenav__item" onClick={onLogout}><LogOut size={18} /><span>Sair</span></button>
      </nav>
    </div>
  );
}

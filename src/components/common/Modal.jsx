import { X } from "lucide-react";

export function Modal({ title, onClose, children, width }) {
  return (
    <div className="wf-modal-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wf-modal" style={width ? { maxWidth: width } : undefined}>
        <div className="wf-modal__head"><h3>{title}</h3><button className="wf-iconbtn" onClick={onClose}><X size={18} /></button></div>
        <div className="wf-modal__body">{children}</div>
      </div>
    </div>
  );
}

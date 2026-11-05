import { LayoutDashboard, ClipboardList, CalendarClock, Wrench, Users, Car, Package, Wallet, MessageCircle, Inbox } from "lucide-react";

export const MENU_ADMIN = [
  { key: "dashboard", label: "Painel", icon: LayoutDashboard },
  { key: "ordens", label: "Ordens de Serviço", icon: ClipboardList },
  { key: "agendamentos", label: "Agendamentos", icon: CalendarClock },
  { key: "servicos", label: "Serviços", icon: Wrench },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "veiculos", label: "Veículos", icon: Car },
  { key: "estoque", label: "Estoque", icon: Package },
  { key: "pagamentos", label: "Pagamentos", icon: Wallet },
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "mensagens", label: "Mensagens", icon: Inbox },
];

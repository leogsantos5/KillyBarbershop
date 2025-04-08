import Swal from 'sweetalert2';

interface ConfirmationDialogProps { title: string; text?: string; html?: string; icon?: 'success' | 'error' | 'warning' | 'info' | 'question'; 
                                    confirmButtonText?: string; cancelButtonText?: string; confirmButtonColor?: string; 
                                    cancelButtonColor?: string; width?: string | number; }

export async function showConfirmationDialog({ title, text, html, icon = 'question', confirmButtonText = 'Sim!', cancelButtonText = 'Cancelar', 
                                               confirmButtonColor = '#3085d6', cancelButtonColor = '#d33', width = '400px'} : ConfirmationDialogProps) {
                                                
  return Swal.fire({ title, text, html, icon, showCancelButton: true, confirmButtonColor, 
                     cancelButtonColor, confirmButtonText, cancelButtonText, width });
}

export async function showDeleteConfirmation() {
  return showConfirmationDialog({title: 'Tem a certeza?', text: 'Esta ação não pode ser desfeita!', icon: 'warning', 
                                 confirmButtonText: 'Sim!', cancelButtonText: 'Cancelar'});
}

export async function showStatusChangeConfirmation(action: string, name: string) {
  return showConfirmationDialog({title: `Deseja ${action}?`, text: `Tem a certeza que deseja ${action} ${name}?`, 
                                 confirmButtonText: `Sim, ${action}!`, cancelButtonText: 'Cancelar'});
}

export async function showAddBarberConfirmation(name: string) {
  return showConfirmationDialog({title: 'Confirmar Adição', text: `Tem a certeza que deseja adicionar o barbeiro ${name}?`, 
                                 icon: 'question', confirmButtonText: 'Sim, adicionar!'});
}

export async function showClientReservationConfirmation(serviceName: string, date: string, time: string, price: number, barberName?: string) {
  return showConfirmationDialog({
    title: 'Confirmar Marcação',
    html: `Deseja fazer uma marcação de <strong>${serviceName}</strong>:<br> <strong>${date}</strong><br>
           às <strong>${time}</strong>${barberName ? ` com <strong>${barberName}</strong>` : ''}?<br>
           <strong>Preço: ${price}€</strong>`,
    confirmButtonText: 'Sim, marcar!', cancelButtonText: 'Cancelar'
  });
}

export async function showReservationBarberConfirmation(clientName: string, serviceName: string, price: number, date: string, time: string) {
  return showConfirmationDialog({
    title: 'Confirmar Marcação do Cliente',
    html: `Deseja confirmar a marcação de <strong>${clientName}</strong> para:<br> <strong>${serviceName}</strong><br> 
           <strong>${date}</strong><br> às <strong>${time}</strong><br> <strong>Preço: ${price}€</strong>`,
    confirmButtonText: 'Confirmar Marcação', cancelButtonText: 'Cancelar', icon: 'question'
  });
} 
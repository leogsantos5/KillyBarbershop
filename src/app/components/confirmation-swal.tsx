import Swal from 'sweetalert2';

interface ConfirmationDialogProps { title: string; text?: string; html?: string; icon?: 'success' | 'error' | 'warning' | 'info' | 'question'; 
                                    confirmButtonText?: string; cancelButtonText?: string; confirmButtonColor?: string; 
                                    cancelButtonColor?: string; width?: string | number; }

export async function showConfirmationDialog({ title, text, html, icon = 'question', confirmButtonText = 'Sim!', cancelButtonText = 'Cancelar', 
                                               confirmButtonColor = '#3085d6', cancelButtonColor = '#d33', width = '400px'} 
                                               : ConfirmationDialogProps) {
                                                
  return Swal.fire({ title, text, html, icon, showCancelButton: true, confirmButtonColor, 
                     cancelButtonColor, confirmButtonText, cancelButtonText, width });
}

export async function showDeleteConfirmation() {
  return showConfirmationDialog({title: 'Tem a certeza?', text: 'Esta ação não pode ser desfeita!', icon: 'warning', 
                                 confirmButtonText: 'Sim!', cancelButtonText: 'Cancelar'});
}

export async function showReservationConfirmation(clientName: string, date: string, time: string) {
  return showConfirmationDialog({title: 'Confirmar Marcação', html: `Tem certeza que deseja confirmar a marcação de:<br>
                                <strong>${clientName}</strong><br> para <strong>${date}</strong><br>às <strong>${time}</strong>?`, 
                                 confirmButtonText: 'Sim, confirmar!', cancelButtonText: 'Cancelar'});
}

export async function showStatusChangeConfirmation(action: string, name: string) {
  return showConfirmationDialog({title: `Deseja ${action}?`, text: `Tem certeza que deseja ${action} ${name}?`, 
                                 confirmButtonText: `Sim, ${action}!`, cancelButtonText: 'Cancelar'});
} 
import Swal from 'sweetalert2';

export const showSuccess = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 1800,
    showConfirmButton: false,
  });
};

export const showError = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#4f46e5',
  });
};

export const confirmAction = async ({
  title,
  text,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
}) => {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
  });

  return result.isConfirmed;
};

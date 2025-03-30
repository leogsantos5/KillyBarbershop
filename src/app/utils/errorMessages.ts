export const ErrorMessages = {  
    RESERVATION: {
      DUPLICATE_PHONE: 'Já existe uma reserva associada a este número de telemóvel.',
      ACTIVE_RESERVATION: 'Já tem uma reserva ativa. Não é possível fazer mais que uma reserva.',
      CREATE_FAILURE: 'Não foi possível criar a reserva.',
      CREATE_USER_FAILURE: 'Não foi possível criar um novo utilizador.',
      FETCH_FAILURE: 'Ocorreu um erro ao carregar as reservas da base de dados.',
      PROCESSING_FAILURE: 'Ocorreu um erro ao processar as reservas.',
      DELETE_FAILURE: 'Ocorreu um erro ao eliminar as reservas.'
    },
    BARBER: {
      CREATE_FAILURE: 'Não foi possível adicionar o barbeiro.',
      DELETE_FAILURE: 'Não foi possível eliminar o barbeiro.',
      UPDATE_STATUS_FAILURE: 'Não foi possível atualizar o estado do barbeiro.',
      FETCH_FAILURE: 'Ocorreu um erro ao carregar os barbeiros.'
    },
    USER: {
      FETCH_FAILURE: 'Erro ao carregar os utilizadores',
      UPDATE_STATUS_FAILURE: 'Erro ao atualizar o estado do utilizador'
    },
    FORM: {
      REQUIRED_NAME: 'Nome é obrigatório',
      REQUIRED_PHONE: 'Número de telemóvel é obrigatório',
      INVALID_PHONE_FORMAT: 'Formato de número de telemóvel inválido',
      INVALID_PHONE: 'Número de telemóvel não existe',
      COUNTRY_CODE_NOT_SUPPORTED: 'País não suportado',
      SLOT_REQUIRED: 'Por favor selecione um horário'
    },
    API: {
      FETCH_FAILED: 'Não foi possível carregar os dados.',
      SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.'
    }
  } as const;
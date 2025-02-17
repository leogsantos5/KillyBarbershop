export const ErrorMessages = {  
    RESERVATION: {
      DUPLICATE_PHONE: 'Já existe uma reserva associada a este número de telemóvel.',
      ACTIVE_RESERVATION: 'Já tem uma reserva ativa. Não é possível fazer mais que uma reserva.',
      CREATE_RESERVATION_FAILURE: 'Não foi possível criar a reserva.',
      CREATE_USER_FAILURE: 'Não foi possível criar um novo utilizador.',
      FETCH_RESERVATIONS_FAILURE: 'Ocorreu um erro ao carregar as reservas da base de dados.',
      RESERVATIONS_PROCESSING_FAILURE: 'Ocorreu um erro ao processar as reservas.'
    },
    FORM: {
      REQUIRED_NAME: 'Nome é obrigatório',
      REQUIRED_PHONE: 'Número de telemóvel é obrigatório',
      INVALID_PHONE: 'Número de telemóvel inválido',
      COUNTRY_CODE_NOT_SUPPORTED: 'País não suportado',
      SLOT_REQUIRED: 'Por favor selecione um horário'
    },
    API: {
      FETCH_FAILED: 'Não foi possível carregar os dados.',
      SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.'
    }
  } as const;
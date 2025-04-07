export const ErrorMessages = {  
    RESERVATION: {
      DUPLICATE_PHONE: 'Já existe uma reserva associada a este número de telemóvel.',
      ACTIVE_RESERVATION: 'Já tem uma reserva ativa. Não é possível fazer mais que uma reserva.',
      CREATE_FAILURE: 'Não foi possível criar a reserva.',
      CREATE_USER_FAILURE: 'Não foi possível criar um novo utilizador.',
      FETCH_FAILURE: 'Ocorreu um erro ao carregar as reservas da base de dados.',
      PROCESSING_FAILURE: 'Ocorreu um erro ao processar as reservas.',
      DELETE_FAILURE: 'Ocorreu um erro ao eliminar as reservas.',
      CONFIRM_FAILURE: 'Ocorreu um erro ao confirmar a reserva.',
      DELETE_SUCCESS: 'Reserva eliminada com sucesso!',
      CONFIRM_SUCCESS: 'Reserva confirmada com sucesso!',
      CONFIRM_BARBER_SUCCESS: 'Marcação confirmada com sucesso!',
    },
    BARBER: {
      CREATE_FAILURE: 'Não foi possível adicionar o barbeiro.',
      DELETE_FAILURE: 'Não foi possível eliminar o barbeiro.',
      UPDATE_STATUS_FAILURE: 'Não foi possível atualizar o estado do barbeiro.',
      FETCH_FAILURE: 'Ocorreu um erro ao carregar os barbeiros.',
      FETCH_BARBER_FAILURE: 'Ocorreu um erro ao carregar o barbeiro.',
      CREATE_SUCCESS: 'Barbeiro adicionado com sucesso!',
      DELETE_SUCCESS: 'Barbeiro eliminado com sucesso!',
      BARBER_ACTIVATED_SUCCESS: 'Barbeiro ativado com sucesso!',
      BARBER_DEACTIVATED_SUCCESS: 'Barbeiro desativado com sucesso!'
    },
    USER: {
      FETCH_FAILURE: 'Erro ao carregar os utilizadores',
      FIND_USER_BY_PHONE_FAILURE: 'Erro ao encontrar o utilizador pelo número de telemóvel',
      UPDATE_STATUS_FAILURE: 'Erro ao atualizar o estado do utilizador',
      OWNER_NOT_FOUND: 'Erro ao encontrar o proprietário',
      USER_BAN_SUCCESS: 'Utilizador banido com sucesso!',
      USER_UNBAN_SUCCESS: 'Utilizador desbanido com sucesso!'
    },
    FORM: {
      REQUIRED_NAME: 'Nome é obrigatório',
      REQUIRED_PHONE: 'Número de telemóvel é obrigatório',
      REQUIRED_SERVICE: 'Tipo de serviço é obrigatório',
      INVALID_PHONE_FORMAT: 'Formato de número de telemóvel inválido',
      INVALID_PHONE: 'Número de telemóvel não existe',
      COUNTRY_CODE_NOT_SUPPORTED: 'País não suportado',
      SLOT_REQUIRED: 'Por favor selecione um horário',
      PASSWORD_NOT_MATCH: 'As passwords não coincidem',
      PASSWORD_INCORRECT: 'Password incorreta'
    },
    API: {
      FETCH_FAILED: 'Não foi possível carregar os dados.',
      SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.'
    },
    AUTH: {
      INVALID_CREDENTIALS: 'Credenciais inválidas',
      BARBER_NOT_FOUND: 'Barbeiro não encontrado',
      OWNER_NOT_FOUND: 'Proprietário não encontrado',
      INVALID_SESSION: 'Sessão inválida',
      SESSION_EXPIRED: 'Sessão expirada. Por favor insira as credenciais novamente.'
    },
    SERVICE: {
      FETCH_FAILURE: "Não foi possível carregar os serviços de barbeiro",
      CREATE_FAILURE: "Não foi possível criar o serviço de barbeiro",
      UPDATE_FAILURE: "Não foi possível atualizar o serviço de barbeiro",
      DELETE_FAILURE: "Não foi possível eliminar o serviço de barbeiro"
    }
  } as const;
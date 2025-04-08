export enum Role {
  ANONYMOUS = 10,
  BARBER = 20,
  OWNER = 30
}

export const checkTokenRole = (requiredRole: Role) => {
  const token = sessionStorage.getItem('authToken');

  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    let userRole: Role;
    
    switch (payload.role) {
      case 'owner':
        userRole = Role.OWNER;
        break;
      case 'barber':
        userRole = Role.BARBER;
        break;
      default:
        userRole = Role.ANONYMOUS;
    }
    
    if (userRole >= requiredRole) {
      return true;
    } else {
      return false;
    }
  } catch { 
    return false;
  }
}; 




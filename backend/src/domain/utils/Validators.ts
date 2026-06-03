export class Validators {
  static isValidName(name: string | null | undefined): boolean {
    if (!name) return false;
    const nameRegex = /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/;
    return nameRegex.test(name);
  }

  static isValidCedula(cedula: string | null | undefined): boolean {
    if (!cedula) return false;
    const cedulaRegex = /^\d{10}$/;
    return cedulaRegex.test(cedula);
  }

  static isValidPhone(phone: string | null | undefined): boolean {
    if (!phone) return false;
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  static isValidPassword(password: string | null | undefined): boolean {
    if (!password) return false;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
    return passwordRegex.test(password);
  }

  static isValidEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

import React from 'react';

// Previene escribir cualquier cosa que no sea un número (0-9) y teclas de control
export const allowOnlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Enter', 'Home', 'End'
  ];
  
  if (allowedKeys.includes(e.key)) {
    return;
  }
  
  // Si no es un número y no hay ctrl/cmd presionado (para copiar/pegar)
  if (!/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
};

// Permite números y un solo punto decimal
export const allowOnlyDecimals = (e: React.KeyboardEvent<HTMLInputElement>, currentValue: string) => {
  const allowedKeys = [
    'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Enter', 'Home', 'End'
  ];
  
  if (allowedKeys.includes(e.key)) {
    return;
  }

  // Permitir punto solo si no existe ya
  if (e.key === '.' && !currentValue.includes('.')) {
    return;
  }

  // Si no es un número y no hay ctrl/cmd presionado
  if (!/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
};

// Previene escribir números
export const allowOnlyLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    'Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Enter', 'Home', 'End', ' '
  ];
  
  if (allowedKeys.includes(e.key)) {
    return;
  }
  
  // Solo permitir letras (incluyendo acentos y ñ)
  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
};

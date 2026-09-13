const AUTH_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Esse e-mail ainda não foi confirmado.',
};

export function translateAuthError(message: string): string {
  return AUTH_ERROR_MAP[message] ?? 'Não foi possível entrar. Tente novamente.';
}

export function translateDbError(code: string | undefined): string {
  if (code === '42501') return 'Você não tem permissão para fazer isso. Confirme se está logado.';
  if (code === '23505') return 'Esse registro já existe.';
  return 'Não foi possível salvar. Tente novamente.';
}

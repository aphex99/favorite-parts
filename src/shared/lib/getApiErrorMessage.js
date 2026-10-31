export function getApiErrorMessage(error) {
  if (error?.status === 'TIMEOUT_ERROR') {
    return 'Время ожидания ответа истекло. Попробуйте ещё раз';
  }

  if (error?.status === 'FETCH_ERROR') {
    return 'Не удалось подключиться к серверу. Проверьте соединение и попробуйте ещё раз';
  }

  const message = error?.data?.error;

  switch (message) {
    case 'Invalid access key':
    case 'Invalid key client!':
    case 'Empty key!':
      return 'Ошибка авторизации API. Проверьте ключ доступа';

    case 'Empty number goods!':
      return 'Введите номер детали';

    case 'Request quota exceeded!':
      return 'Лимит запросов превышен. Попробуйте позже';

    default:
      return 'Не удалось загрузить данные. Попробуйте ещё раз';
  }
}

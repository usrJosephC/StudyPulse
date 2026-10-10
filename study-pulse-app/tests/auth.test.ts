import test from 'node:test'
import assert from 'node:assert/strict'
import { mapAuthError, toAppError } from '../src/lib/result.ts'

test('traduz credenciais inválidas para erro acionável em PT-BR', () => {
  assert.deepEqual(mapAuthError({ message: 'Invalid login credentials' }), { code: 'auth', message: 'E-mail ou senha incorretos.' })
})

test('nao expoe mensagem tecnica desconhecida a UI', () => {
  const result = toAppError(new Error('duplicate key value violates unique constraint'))
  assert.equal(result.code, 'unknown')
  assert.equal(result.message, 'N\u00e3o foi poss\u00edvel concluir a opera\u00e7\u00e3o.')
})
test('traduz e-mail não confirmado', () => {
  assert.deepEqual(mapAuthError({ message: 'Email not confirmed' }), { code: 'auth', message: 'Confirme seu e-mail antes de entrar.' })
})
test('classifica falha de rede sem expor mensagem técnica à UI', () => {
  const result = toAppError(new Error('Network request failed'))
  assert.equal(result.code, 'network')
  assert.equal(result.message, 'Sem conexão com a internet. Verifique sua rede e tente novamente.')
})

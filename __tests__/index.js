import AvoineSSOClient from '../index';

const ssoClient = new AvoineSSOClient();

/**
 * Validate getCodeUrl()
 */
test('getCodeUrl', () => {
  expect(
    ssoClient.getCodeUrl('http://example.com', 'my_instance', 'abc123')
  )
  .toBe('http://example.com/codes/get/my_instance/?s=abc123')
});

/**
 * Validate getUseUrl()
 */
test('getUseUrl', () => {
  expect(
    ssoClient.getUseUrl('http://example.com', 'my_instance', '123456', 'abba1234')
  )
  .toBe('http://example.com/codes/use/my_instance/?code=123456&hash=abba1234')
});

/**
 * Validate requestCode()
 */
test('requestCode fails on empty', async () => {
  expect.assertions(1)
  return ssoClient.requestCode()
  .catch(error => {
    expect(error).toBe('EMPTY_SENSE_CODE')
  })
});

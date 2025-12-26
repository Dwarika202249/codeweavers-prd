// Google Sign-In API Types
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string;
  }
  function initialize(config: { client_id: string; callback: (response: CredentialResponse) => void }): void;
  function renderButton(
    element: HTMLElement,
    options: { theme: string; size: string; width?: string; text?: string }
  ): void;
}

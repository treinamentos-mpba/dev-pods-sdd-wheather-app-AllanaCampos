import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it.each(['', '   '])('não chama onSearch quando o input contém %j', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    if (value) {
      await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), value);
    }
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma cidade.');
  });

  it('envia o termo digitado sem espaços externos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '  São Paulo  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('limpa o erro de validação quando o usuário começa a corrigir o campo', async () => {
    const user = userEvent.setup();

    render(<SearchBar onSearch={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

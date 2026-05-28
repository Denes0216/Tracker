import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Choices } from './Choices';

describe('Choices', () => {
  it('calls onPick with the chosen value', async () => {
    const onPick = vi.fn();
    render(
      <Choices choices={['A', 'B', 'C', 'D']} revealed={false} picked={null} correct="A" onPick={onPick} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /B/ }));
    expect(onPick).toHaveBeenCalledWith('B');
  });

  it('disables buttons once revealed', () => {
    render(<Choices choices={['A', 'B']} revealed picked="B" correct="A" onPick={() => {}} />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
});

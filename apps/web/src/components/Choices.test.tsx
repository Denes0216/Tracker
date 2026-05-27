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
    await userEvent.click(screen.getByText('B'));
    expect(onPick).toHaveBeenCalledWith('B');
  });

  it('disables buttons once revealed', () => {
    render(<Choices choices={['A', 'B']} revealed picked="B" correct="A" onPick={() => {}} />);
    expect(screen.getByText('A')).toBeDisabled();
    expect(screen.getByText('B')).toBeDisabled();
  });
});

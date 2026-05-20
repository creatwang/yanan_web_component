import { css } from "lit";

export const demoAddressSkeletonStyles = css`
  .skeleton-stack {
    display: grid;
    gap: 14px;
    min-width: 0;
  }

  .skeleton-line {
    border-radius: var(--yn-demo-radius, 12px);
    background: linear-gradient(
      90deg,
      var(--yn-color-bg-muted, #f3efe7) 0%,
      var(--yn-color-surface-hover, rgba(255, 255, 255, 0.86)) 50%,
      var(--yn-color-bg-muted, #f3efe7) 100%
    );
    background-size: 200% 100%;
    animation: yn-demo-shimmer 1.15s ease-in-out infinite;
  }

  .skeleton-line--banner {
    height: 52px;
  }

  .skeleton-line--field {
    height: 44px;
  }

  .skeleton-line--short {
    width: 42%;
    height: 12px;
    border-radius: 6px;
  }

  .skeleton-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 520px) {
    .skeleton-grid-2 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @keyframes yn-demo-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }

  .skeleton-hint {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  }
`;

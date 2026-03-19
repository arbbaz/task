import { render, screen } from "@testing-library/react";
import ReviewsFeed from "./ReviewsFeed";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      emptyReviews: "No reviews yet. Be the first to review!",
      somethingWentWrong: "Something went wrong",
      couldNotLoadPage: "We couldn't load this page. Please try again.",
      tryAgain: "Try again",
    })[key] ?? key,
}));

const useReviewsFeedMock = vi.fn();
const useReviewAuthorsFollowStatusMock = vi.fn();

vi.mock("@/features/reviews/hooks/useReviewsFeed", () => ({
  useReviewsFeed: () => useReviewsFeedMock(),
}));

vi.mock("@/features/reviews/hooks/useReviewAuthorsFollowStatus", () => ({
  useReviewAuthorsFollowStatus: () => useReviewAuthorsFollowStatusMock(),
}));

vi.mock("@/shared/hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: vi.fn(),
}));

vi.mock("@/features/reviews/components/ReviewCard", () => ({
  default: ({ review }: { review: { title: string } }) => <div>{review.title}</div>,
}));

describe("ReviewsFeed", () => {
  beforeEach(() => {
    useReviewAuthorsFollowStatusMock.mockReturnValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders an error state when the feed fails before loading content", () => {
    useReviewsFeedMock.mockReturnValue({
      reviews: [],
      loading: false,
      loadingMore: false,
      hasMore: false,
      loadMore: vi.fn(),
      updateReviewVote: vi.fn(),
      fetchReviews: vi.fn(),
      errorMessage: "Feed request failed",
    });

    render(<ReviewsFeed initialReviews={[]} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Feed request failed")).toBeInTheDocument();
  });

  it("renders review cards when feed data is present", () => {
    useReviewsFeedMock.mockReturnValue({
      reviews: [{ id: "1", title: "First review", author: { username: "alice", id: "1" } }],
      loading: false,
      loadingMore: false,
      hasMore: false,
      loadMore: vi.fn(),
      updateReviewVote: vi.fn(),
      fetchReviews: vi.fn(),
      errorMessage: null,
    });

    render(<ReviewsFeed initialReviews={[]} />);

    expect(screen.getByText("First review")).toBeInTheDocument();
  });
});

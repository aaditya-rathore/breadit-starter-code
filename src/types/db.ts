import { Post, Subreddit, Vote, Comment } from "@prisma/client";

export type ExtendedPost = Post & {
    subreddit: Subreddit,
    votes: Vote[],
    comments: Comment[],
}
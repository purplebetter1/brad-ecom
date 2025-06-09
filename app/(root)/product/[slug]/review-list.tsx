"use client";
import { useState, useEffect } from "react";
import { Review } from "@/types";
import { getReviews } from "@/lib/actions/review.actions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import ReviewForm from "./review-form";
import { Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };
    loadReviews();
  }, [productId]);

  // Reload reviews after created or updated
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
  };

  return (
    <>
      <div className="space-y-4">
        {reviews.length === 0 && <div>No Reviews Yet</div>}
        {userId ? (
          <ReviewForm
            userId={userId}
            productId={productId}
            onReviewSubmitted={reload}
          />
        ) : (
          <div>
            {" "}
            Please{" "}
            <Link
              className="text-blue-700 px-2"
              href={`/sign-in?callbackUrl=/product/${productSlug}`}
            >
              sign in
            </Link>
            to write a review
          </div>
        )}
        <div className="flex flex-col gap-3"></div>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-bet">
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {review.user ? review.user.name : "User"}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDateTime(review.createdAt).dateTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ReviewList;

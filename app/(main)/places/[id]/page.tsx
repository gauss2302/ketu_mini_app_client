"use client";

import { PlaceDetails } from "@/app/components/place-details";
import { use } from "react";

export default function PlaceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <PlaceDetails placeId={resolvedParams.id} />;
}

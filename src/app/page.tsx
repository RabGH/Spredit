import GeneralFeed from "@/components/postComponents/GeneralFeed";
import CustomFeed from "@/components/postComponents/CustomFeed";
import { getAuthSession } from "@/lib/auth";
import ExploreCard from "@/components/cardComponents/ExploreCard";
import CreateCommunityCard from "@/components/cardComponents/CreateCommunityCard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
// Do not use prettier, or fix it after
export default async function Home() {
  const session = await getAuthSession();
  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {/* @ts-expect-error server component */}
        {session ? (
          <CustomFeed className="order-2 md:order-1" />
        ) : (
          <GeneralFeed className="order-2 md:order-1" />
        )}

        <CreateCommunityCard />
        {/* <ExploreCard /> */}
      </div>
    </>
  );
}

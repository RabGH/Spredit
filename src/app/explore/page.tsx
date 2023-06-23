import GeneralFeed from "@/components/feedComponents/GeneralFeed";
import HomeCard from "@/components/cardComponents/HomeCard";
import CreateCommunityCard from "@/components/cardComponents/CreateCommunityCard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Explore() {
  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl">Explore</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {/* @ts-expect-error server component */}
        <GeneralFeed />
        <div className="order-1 space-y-6">
          <CreateCommunityCard />
          <HomeCard />
        </div>
      </div>
    </>
  );
}

import { prisma } from "@/lib/prisma";
import { getIsSubscribed } from "../video/get-is-subscribed";
import { getVideosByUserId } from "../video/get-videos-by-user-id";

export const getUserById = async ({ userId, requestUserId }: { userId: string, requestUserId?: string }) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			avatarUrl: true,
			age: true,
			email: true,
			role: true,
			username: true,
			createdAt: true,
			subscribers: true,

		},
	});

	if (!user) {
		return null;
	}

	return {
		...user,
		isSubscribed: await getIsSubscribed({ channelId: user.id, userId: requestUserId }),
		subscribersCount: user.subscribers.length,
		videos: await getVideosByUserId({ userId: user.id }),
	};
};

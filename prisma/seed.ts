import { faker } from "@faker-js/faker";
import {
	LikeType,
	PrismaClient,
	Role,
	VideoSegment,
	Visibility,
} from "../generated/prisma";
import { makeUser } from "./../src/lib/mocks/make-user";
import { mockVideos } from "./../src/lib/mocks/make-video";

const prisma = new PrismaClient();

async function seed() {
	await prisma.like.deleteMany();
	await prisma.comment.deleteMany();
	await prisma.video.deleteMany();
	await prisma.subscription.deleteMany();
	await prisma.user.deleteMany();

	const { user: testUser } = await makeUser({
		id: "681e4b70c5d2d52d0a5f9f3a",
		name: "test user",
		username: "testuser",
		email: "test@test.com",
		password: "123456",
		age: 22,
		role: Role.ADMIN,
	});


	const users = await Promise.all(
		Array.from({ length: 10 }).map(async () => {
			return prisma.user.create({
				data: {
					name: faker.person.fullName(),
					username: faker.internet.username().toLowerCase(),
					email: faker.internet.email().toLowerCase(),
					password: "123456",
					age: faker.number.int({ min: 18, max: 40 }),
					role: Role.USER,
					avatarUrl: faker.image.avatar(),
				},
			});
		}),
	);

	const allUsers = [testUser, ...users];


	for (const user of users) {
		await prisma.subscription.create({
			data: {
				subscriberId: user.id,
				subscribedToId: testUser.id,
			},
		});
	}


	const videos = [];

	for (let i = 0; i < 20; i++) {
		const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];

		const video = await prisma.video.create({
			data: {
				title: faker.lorem.sentence(),
				description: faker.lorem.paragraph(),
				videoUrl: faker.helpers.arrayElement(mockVideos),
				thumbnailUrl: `https:
				duration: `${ faker.number.int({ min: 1, max: 59 }) }: ${
			faker.number.int({
				min: 10,
				max: 59,
			})
		}`,
				views: faker.number.int({ min: 0, max: 100000 }),
				visibility: faker.helpers.arrayElement([
					Visibility.PUBLIC,
					Visibility.UNLISTED,
					Visibility.PRIVATE,
				]),
				segment: faker.helpers.arrayElement([
					VideoSegment.BACKEND,
					VideoSegment.FRONTEND,
					VideoSegment.FULLSTACK,
					VideoSegment.ARTIFICIAL_INTELLIGENCE,
					VideoSegment.DATA_SCIENCE,
					VideoSegment.DEVOPS,
				]),
				tags: faker.helpers.arrayElements(
					[
						"react",
						"nextjs",
						"node",
						"nestjs",
						"docker",
						"typescript",
						"prisma",
						"mongodb",
						"tailwind",
						"ai",
					],
					3,
				),
				userId: randomUser.id,
			},
		});

		videos.push(video);
	}

	
	const comments = [];

	for (let i = 0; i < 50; i++) {
		const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];

		const randomVideo = videos[Math.floor(Math.random() * videos.length)];

		const comment = await prisma.comment.create({
			data: {
				content: faker.lorem.sentences(2),
				authorId: randomUser.id,
				videoId: randomVideo.id,
			},
		});

		comments.push(comment);
	}

	
	for (let i = 0; i < 100; i++) {
		const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];

		const randomVideo = videos[Math.floor(Math.random() * videos.length)];

		try {
			await prisma.like.create({
				data: {
					type: LikeType.VIDEO,
					userId: randomUser.id,
					videoId: randomVideo.id,
				},
			});

			await prisma.user.update({
				where: {
					id: randomUser.id,
				},
				data: {
					likedVideoIds: {
						push: randomVideo.id,
					},
				},
			});
		} catch { }
	}

	
	for (let i = 0; i < 100; i++) {
		const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];

		const randomComment = comments[Math.floor(Math.random() * comments.length)];

		try {
			await prisma.like.create({
				data: {
					type: LikeType.COMMENT,
					userId: randomUser.id,
					commentId: randomComment.id,
				},
			});

			await prisma.user.update({
				where: {
					id: randomUser.id,
				},
				data: {
					likedCommentIds: {
						push: randomComment.id,
					},
				},
			});
		} catch { }
	}

	
	for (const user of allUsers) {
		const randomVideos = faker.helpers.arrayElements(videos, 5);

		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				watchLaterIds: {
					set: randomVideos.map((video) => video.id),
				},
				historyIds: {
					set: faker.helpers.arrayElements(videos, 10).map((video) => video.id),
				},
			},
		});
	}

	console.log("✅ Seed completed");
}

seed()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

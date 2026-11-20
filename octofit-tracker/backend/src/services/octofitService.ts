import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function isValidObjectId(id: unknown): boolean {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const data = input as Record<string, unknown>;
  
  if (!data.userId || !data.teamId || !data.type || data.minutes === undefined) {
    throw Object.assign(new Error('Missing required fields: userId, teamId, type, minutes'), { status: 400 });
  }

  if (!isValidObjectId(data.userId) || !isValidObjectId(data.teamId)) {
    throw Object.assign(new Error('Invalid userId or teamId format'), { status: 400 });
  }

  const user = await User.findById(data.userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }

  const team = await Team.findById(data.teamId);
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 400 });
  }

  const points = typeof data.minutes === 'number' ? data.minutes : 0;
  
  const activity = await Activity.create({
    user: data.userId,
    team: data.teamId,
    type: data.type,
    minutes: data.minutes,
    points,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const data = input as Record<string, unknown>;
  
  if (!data.name) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }

  const team = await Team.create({
    name: data.name,
    mascot: data.mascot,
    members: Array.isArray(data.members) ? data.members : [],
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const result = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'teamInfo',
      },
    },
    {
      $unwind: '$teamInfo',
    },
    {
      $sort: { totalPoints: -1 },
    },
    {
      $project: {
        teamName: '$teamInfo.name',
        totalPoints: 1,
        _id: 0,
      },
    },
  ]);

  return result.map((team, index) => ({
    ...team,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: decodeURIComponent(userEmail) });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();
  
  if (recentActivities.length === 0) {
    const allWorkouts = await Workout.find().lean();
    return allWorkouts.map(w => ({ ...w, reason: 'No recent activities, suggesting popular workout' }));
  }

  const activityTypes = recentActivities.map(a => a.type);
  const mostCommonType = activityTypes[0];

  let suggestions = await Workout.find({ focus: user.fitnessGoal }).lean();
  
  if (suggestions.length === 0) {
    suggestions = await Workout.find({ focus: mostCommonType }).lean();
  }

  if (suggestions.length === 0) {
    suggestions = await Workout.find().limit(3).lean();
  }

  return suggestions.map(w => ({
    ...w,
    reason: `Matches your ${user.fitnessGoal} goal and recent ${mostCommonType} activity`,
  }));
}

export { User };

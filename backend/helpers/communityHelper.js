// helpers/communityHelper.js
import Community from "../models/community/community.model.js";

export async function getCommunityAndMember(communityId, userId) {
  const community = await Community.findById(communityId).select("members");
  if (!community) throw new Error("Community not found");

  const member = community.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return { community, member };
}

export function ensureMemberOrThrow(member) {
  if (!member) {
    const e = new Error("Not a member of community");
    e.code = "NOT_MEMBER";
    throw e;
  }
  if (member.blocked) {
    const e = new Error("Blocked in community");
    e.code = "BLOCKED";
    throw e;
  }
}

export function ensureRoleOrThrow(member, allowedRoles = ["admin"]) {
  if (!allowedRoles.includes(member.role)) {
    const e = new Error("Insufficient role");
    e.code = "INSUFFICIENT_ROLE";
    throw e;
  }
}

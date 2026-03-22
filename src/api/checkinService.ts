import { API_BASE_URL, ENDPOINTS } from './config';

export interface CheckinData {
  memberID: string;
  fullname: string;
  TotalCheckins: number;
  branch: string;
  imageLoc: string;
  MemberRank: number;
}

export interface MemberRankInfo extends CheckinData {
  isCurrentUser: boolean;
}

export const getTopTenCheckinsWithRank = async (
  branchName: string,
  memberId: string
): Promise<{ topCheckins: CheckinData[]; memberRank: MemberRankInfo | null }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.TOP_TEN_CHECKINS}?branchName=${branchName}&memberId=${memberId}`
    );
    
    const data = await response.json();
    
    if (data.status === 200 && data.data) {
      const topCheckins = data.data;
      const memberRank = topCheckins.find(
        (member: CheckinData) => member.memberID === memberId
      ) as MemberRankInfo | undefined;
      
      return {
        topCheckins,
        memberRank: memberRank ? { ...memberRank, isCurrentUser: true } : null,
      };
    }
    
    throw new Error(data.message || 'Failed to fetch checkins');
  } catch (error) {
    console.error('Error fetching top checkins:', error);
    throw error;
  }
};

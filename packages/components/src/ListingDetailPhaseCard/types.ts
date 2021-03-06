import { EthAddress } from "@joincivil/core";

export interface ListingDetailPhaseCardComponentProps {
  challenge?: any;
  listing?: any;
  listingAddress?: EthAddress;
  transactions?: any[];
  modalContentComponents?: any;
}

export interface PhaseWithExpiryProps {
  endTime: number;
  phaseLength: number;
}

export interface SubmitChallengeProps {
  handleSubmitChallenge?(): void;
}

export interface ChallengePhaseProps {
  challengeID?: string;
  isViewingUserChallenger?: boolean;
  challenger: EthAddress;
  rewardPool: string;
  stake: string;
  userHasCommittedVote?: boolean;
  userHasRevealedVote?: boolean;
}

export interface CommitVoteProps {
  newsroomName?: string;
  tokenBalance: number;
  salt?: string;
  numTokens?: string;
  userHasCommittedVote?: boolean;
  userHasRevealedVote?: boolean;
  onInputChange(propsData: any, validateFn?: () => boolean): void;
  onReviewVote(): void;
}

export interface RevealVoteProps {
  newsroomName?: string;
  salt: string | undefined;
  transactions: any[];
  modalContentComponents?: any;
  onInputChange(propsData: any, validateFn?: () => boolean): void;
}

export interface AppealDecisionProps {
  appealGranted: boolean;
}

export interface AppealChallengePhaseProps {
  appealChallengeID: string;
}

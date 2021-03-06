import BigNumber from "bignumber.js";
import { createSelector } from "reselect";
import { Map, List } from "immutable";
import {
  canListingBeChallenged,
  EthAddress,
  canAppealBeResolved as getCanAppealBeResolved,
  canBeWhitelisted as getCanBeWhitelisted,
  canResolveChallenge as getCanResolveChallenge,
  isInApplicationPhase,
  isChallengeInCommitStage,
  isChallengeInRevealStage,
  isAwaitingAppealRequest as getIsAwaitingAppealRequest,
  isListingAwaitingAppealJudgment as getIsListingAwaitingAppealJudgement,
  isListingAwaitingAppealChallenge as getIsListingAwaitingAppealChallenge,
  isAwaitingAppealChallenge as getIsAwaitingAppealChallenge,
  isInAppealChallengeCommitPhase as getIsInAppealChallengeCommitPhase,
  isInAppealChallengeRevealPhase as getIsInAppealChallengeRevealPhase,
  canListingAppealChallengeBeResolved as getCanListingAppealChallengeBeResolved,
  isAppealAwaitingJudgment,
  ListingWrapper,
  UserChallengeData,
  WrappedChallengeData,
  TimestampedEvent,
} from "@joincivil/core";
import { NewsroomState } from "@joincivil/newsroom-manager";
import { State } from "../reducers";

// @TODO(jon): Export this in reducers?
import { ListingWrapperWithExpiry, ListingExtendedMetadata } from "../reducers/listings";

export interface ListingContainerProps {
  listingAddress?: EthAddress;
}

export interface ChallengeContainerProps {
  challengeID?: string | BigNumber;
}

export const getUser = (state: State) => {
  return state.networkDependent.user;
};

export const getNewsroom = (state: State, props: ListingContainerProps): NewsroomState | undefined => {
  if (!props.listingAddress) {
    return;
  }
  return state.newsrooms.get(props.listingAddress);
};

export const makeGetIsUserNewsroomOwner = () => {
  return createSelector([getNewsroom, getUser], (newsroom, user) => {
    if (!newsroom || !user) {
      return;
    }
    const newsroomWrapper = newsroom.wrapper;
    const userAccount = user.account && user.account.account;
    return newsroomWrapper.data.owners.includes(userAccount);
  });
};

export const getListings = (state: State) => state.networkDependent.listings;

export const getListingWrapper = (state: State, props: ListingContainerProps) => {
  if (!props.listingAddress) {
    return;
  }
  const listings: Map<string, ListingWrapperWithExpiry> = state.networkDependent.listings;
  const listingAddress = props.listingAddress;
  const listing: ListingWrapperWithExpiry | undefined = listings.get(listingAddress)
    ? listings.get(listingAddress)
    : undefined;
  return listing;
};

export const makeGetListing = () => {
  return createSelector([getListingWrapper], listingWrapper => {
    const listing: ListingWrapper | undefined = listingWrapper ? listingWrapper.listing : undefined;
    return listing;
  });
};

export const getChallenges = (state: State) => state.networkDependent.challenges;

export const getChallenge = (state: State, props: ChallengeContainerProps) => {
  let { challengeID } = props;
  if (!challengeID) {
    return;
  }
  if (typeof challengeID !== "string") {
    challengeID = challengeID.toString();
  }
  const challenges = state.networkDependent.challenges;
  const challenge: WrappedChallengeData = challenges.get(challengeID);
  return challenge;
};

export const getChallengeUserData = (state: State) => state.networkDependent.challengeUserData;

export const getChallengeUserDataMap = createSelector(
  [getChallengeUserData, (state: State, props: ChallengeContainerProps) => props],
  (challengeUserData, props: ChallengeContainerProps) => {
    let { challengeID } = props;
    if (!challengeID) {
      return;
    }
    if (typeof challengeID !== "string") {
      challengeID = challengeID.toString();
    }
    const challengeUserDataMap = challengeUserData.get(challengeID);
    return challengeUserDataMap;
  },
);

export const makeGetUserChallengeData = () => {
  return createSelector([getChallengeUserDataMap, getUser], (challengeUserDataMap, user) => {
    if (challengeUserDataMap && user.account) {
      const userChallengeData: UserChallengeData = challengeUserDataMap.get(user.account.account);
      return userChallengeData;
    }
    return;
  });
};

export const makeGetUserChallengesWithUnclaimedRewards = () => {
  return createSelector([getChallengeUserData, getUser], (challengeUserData, user) => {
    if (challengeUserData && user.account) {
      return challengeUserData
        .filter((challengeData, challengeID, iter): boolean => {
          const { didUserReveal, didUserCollect, isVoterWinner } = challengeData!.get(user.account.account);
          return !!didUserReveal && !!isVoterWinner && !didUserCollect;
        })
        .keySeq()
        .toSet();
    }
    return;
  });
};

export const makeGetUserChallengesWithUnrevealedVotes = () => {
  return createSelector([getChallenges, getChallengeUserData, getUser], (challenges, challengeUserData, user) => {
    if (challengeUserData && user.account) {
      return challengeUserData
        .filter((challengeData, challengeID, iter): boolean => {
          const { didUserCommit, didUserReveal } = challengeData!.get(user.account.account);
          const challenge = challenges.get(challengeID!);
          const inRevealPhase = challenge && isChallengeInRevealStage(challenge.challenge);
          return !!didUserCommit && !didUserReveal && inRevealPhase;
        })
        .keySeq()
        .toSet();
    }
    return;
  });
};

export const makeGetUserChallengesWithRescueTokens = () => {
  return createSelector([getChallenges, getChallengeUserData, getUser], (challenges, challengeUserData, user) => {
    if (challengeUserData && user.account) {
      return challengeUserData
        .filter((challengeData, challengeID, iter): boolean => {
          const { didUserCommit, didUserReveal } = challengeData!.get(user.account.account);
          const challenge = challenges.get(challengeID!);
          const isResolved = challenge && challenge.challenge.resolved;
          return !!didUserCommit && !didUserReveal && isResolved;
        })
        .keySeq()
        .toSet();
    }
    return;
  });
};

export const makeGetListingAddressByChallengeID = () => {
  return createSelector([getChallenge, getListings], (challenge, listings) => {
    let listingAddress;

    if (challenge) {
      listingAddress = challenge.listingAddress;
    }

    return listingAddress;
  });
};

export const makeGetListingExpiry = () => {
  return createSelector([getListingWrapper], listingWrapper => {
    return listingWrapper ? listingWrapper.expiry : undefined;
  });
};

export const makeGetChallengeState = () => {
  return createSelector([getChallenge], challengeData => {
    const challenge = challengeData && challengeData.challenge;
    const isResolved = challenge && challenge.resolved;
    const inCommitPhase = challenge && isChallengeInCommitStage(challenge);
    const inRevealPhase = challenge && isChallengeInRevealStage(challenge);
    const canResolveChallenge = challenge && getCanResolveChallenge(challenge);
    const isAwaitingAppealJudgment = challenge && challenge.appeal && isAppealAwaitingJudgment(challenge.appeal);
    const canAppealBeResolved = challenge && challenge.appeal && getCanAppealBeResolved(challenge.appeal);
    const isAwaitingAppealChallenge = challenge && challenge.appeal && getIsAwaitingAppealChallenge(challenge.appeal);

    return {
      isResolved,
      inCommitPhase,
      inRevealPhase,
      canResolveChallenge,
      isAwaitingAppealJudgment,
      isAwaitingAppealChallenge,
      canAppealBeResolved,
    };
  });
};

export const makeGetListingPhaseState = () => {
  return createSelector([getListingWrapper], listing => {
    if (!listing) {
      return;
    }

    const listingData = listing.listing.data;

    const isInApplication = isInApplicationPhase(listingData);
    const canBeChallenged = canListingBeChallenged(listingData);
    const canBeWhitelisted = getCanBeWhitelisted(listingData);

    const inChallengeCommitVotePhase = listingData.challenge && isChallengeInCommitStage(listingData.challenge);
    const inChallengeRevealPhase = listingData.challenge && isChallengeInRevealStage(listingData.challenge);
    const isAwaitingAppealRequest = getIsAwaitingAppealRequest(listingData);
    const canResolveChallenge = listingData.challenge && getCanResolveChallenge(listingData.challenge);

    const isAwaitingAppealJudgment = getIsListingAwaitingAppealJudgement(listingData);
    const isAwaitingAppealChallenge = getIsListingAwaitingAppealChallenge(listingData);
    const isInAppealChallengeCommitPhase = getIsInAppealChallengeCommitPhase(listingData);
    const isInAppealChallengeRevealPhase = getIsInAppealChallengeRevealPhase(listingData);
    const canListingAppealChallengeBeResolved = getCanListingAppealChallengeBeResolved(listingData);

    const isUnderChallenge = listingData.challenge && !listingData.challenge.resolved;
    const isWhitelisted = listingData.isWhitelisted;
    const isRejected = !isWhitelisted && !isInApplication && !canBeWhitelisted && !listingData.challenge;

    return {
      isInApplication,
      canBeChallenged,
      canBeWhitelisted,
      canResolveChallenge,
      inChallengeCommitVotePhase,
      inChallengeRevealPhase,
      isAwaitingAppealRequest,
      isWhitelisted,
      isUnderChallenge,
      isRejected,
      isAwaitingAppealJudgment,
      isAwaitingAppealChallenge,
      isInAppealChallengeCommitPhase,
      isInAppealChallengeRevealPhase,
      canListingAppealChallengeBeResolved,
    };
  });
};

export const getHistories = (state: State) => state.networkDependent.histories;

export const getListingHistory = (state: State, props: ListingContainerProps) => {
  const listingHistory: List<TimestampedEvent<any>> | undefined = state.networkDependent.histories.get(
    props.listingAddress!,
  );
  return listingHistory || List();
};

export const getListingExtendedMetadata = (state: State, props: ListingContainerProps) => {
  const listingExtendedMetadata:
    | ListingExtendedMetadata
    | undefined = state.networkDependent.listingsExtendedMetadata.get(props.listingAddress!);
  return listingExtendedMetadata;
};

export const makeGetLatestChallengeSucceededChallengeID = () => {
  return createSelector([getListingExtendedMetadata], listingExtendedMetadata => {
    if (listingExtendedMetadata && listingExtendedMetadata.latestChallengeID) {
      const { latestChallengeID } = listingExtendedMetadata;
      return latestChallengeID;
    }
    return;
  });
};

export const makeGetLatestListingRemovedTimestamp = () => {
  return createSelector([getListingExtendedMetadata], listingExtendedMetadata => {
    if (listingExtendedMetadata && listingExtendedMetadata.listingRemovedTimestamp) {
      const { listingRemovedTimestamp } = listingExtendedMetadata;
      return listingRemovedTimestamp;
    }
    return;
  });
};

export const makeGetLatestWhitelistedTimestamp = () => {
  return createSelector([getListingExtendedMetadata], listingExtendedMetadata => {
    if (listingExtendedMetadata && listingExtendedMetadata.whitelistedTimestamp) {
      const { whitelistedTimestamp } = listingExtendedMetadata;
      return whitelistedTimestamp;
    }
    return;
  });
};

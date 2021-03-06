import * as React from "react";
import { getLocalDateTimeStrings } from "@joincivil/utils";
import { ListingDetailPhaseCardComponentProps, ChallengePhaseProps, PhaseWithExpiryProps } from "./types";
import {
  StyledListingDetailPhaseCardContainer,
  StyledListingDetailPhaseCardSection,
  StyledPhaseDisplayName,
  StyledPhaseKicker,
  CTACopy,
  MetaRow,
  MetaItem,
  MetaItemValue,
  MetaItemValueLong,
  MetaItemLabel,
} from "./styledComponents";
import { TransactionInvertedButton } from "../TransactionButton";
import { ProgressBarCountdownTimer } from "../PhaseCountdown/";
import { ChallengeResults, ChallengeResultsProps } from "../ChallengeResultsChart";
import { ChallengePhaseDetail } from "./ChallengePhaseDetail";
import { NeedHelp } from "./NeedHelp";

export interface AppealProps {
  requester: string;
  appealFeePaid: string;
}

export type AppealAwaitingDecisionCardProps = ListingDetailPhaseCardComponentProps &
  PhaseWithExpiryProps &
  ChallengePhaseProps &
  ChallengeResultsProps &
  AppealProps;

const GrantAppealButton: React.StatelessComponent<AppealAwaitingDecisionCardProps> = props => {
  return (
    <TransactionInvertedButton transactions={props.transactions!} modalContentComponents={props.modalContentComponents}>
      Grant Appeal
    </TransactionInvertedButton>
  );
};

export const AppealAwaitingDecisionCard: React.StatelessComponent<AppealAwaitingDecisionCardProps> = props => {
  const localDateTime = getLocalDateTimeStrings(props.endTime);
  return (
    <StyledListingDetailPhaseCardContainer>
      <StyledListingDetailPhaseCardSection>
        <StyledPhaseKicker>Challenge ID {props.challengeID}</StyledPhaseKicker>
        <StyledPhaseDisplayName>Appeal to Council</StyledPhaseDisplayName>
        <ProgressBarCountdownTimer
          endTime={props.endTime}
          totalSeconds={props.phaseLength}
          displayLabel="Waiting for Council's decision"
          flavorText="under Appeal to Council"
        />
      </StyledListingDetailPhaseCardSection>

      <ChallengePhaseDetail
        challengeID={props.challengeID}
        challenger={props.challenger}
        rewardPool={props.rewardPool}
        stake={props.stake}
      />

      <StyledListingDetailPhaseCardSection>
        <ChallengeResults
          collapsable={true}
          totalVotes={props.totalVotes}
          votesFor={props.votesFor}
          votesAgainst={props.votesAgainst}
          percentFor={props.percentFor}
          percentAgainst={props.percentAgainst}
        />
      </StyledListingDetailPhaseCardSection>

      <StyledListingDetailPhaseCardSection>
        <MetaRow>
          <MetaItem>
            <MetaItemLabel>Requester</MetaItemLabel>
            <MetaItemValueLong>{props.requester}</MetaItemValueLong>
          </MetaItem>
        </MetaRow>
        <MetaRow>
          <MetaItem>
            <MetaItemLabel>Appeal Fee Paid</MetaItemLabel>
            <MetaItemValue>{props.appealFeePaid}</MetaItemValue>
          </MetaItem>
        </MetaRow>
      </StyledListingDetailPhaseCardSection>

      <StyledListingDetailPhaseCardSection>
        <CTACopy>
          Check back on {localDateTime[0]} for Civil Council’s decision to reject or grant the appeal. Read more for
          details of this appeal.
        </CTACopy>

        {props.transactions && <GrantAppealButton {...props} />}
      </StyledListingDetailPhaseCardSection>

      <NeedHelp />
    </StyledListingDetailPhaseCardContainer>
  );
};

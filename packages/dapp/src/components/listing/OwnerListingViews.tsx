import * as React from "react";
import { EthAddress, TwoStepEthTransaction } from "@joincivil/core";
import { approve, depositTokens } from "../../apis/civilTCR";
import { InputElement, StyledFormContainer, FormGroup } from "../utility/FormElements";
import TransactionButton from "../utility/TransactionButton";
import BigNumber from "bignumber.js";

export interface OwnerListingViewProps {
  listingAddress: EthAddress;
}

export interface DepositTokensState {
  numTokens?: string;
}

export class DepositTokens extends React.Component<OwnerListingViewProps, DepositTokensState> {
  constructor(props: any) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <StyledFormContainer>
        <h3>Deposit Additional Tokens</h3>
        <FormGroup>
          <label>
            Number of Tokens
            <InputElement
              type="text"
              name="numTokens"
              // validate={this.validateVoteCommittedTokens}
              onChange={this.updateViewState}
            />
          </label>
        </FormGroup>

        <FormGroup>
          <TransactionButton transactions={[{ transaction: this.approveDeposit }, { transaction: this.deposit }]}>
            Deposit
          </TransactionButton>
        </FormGroup>
      </StyledFormContainer>
    );
  }

  private approveDeposit = async (): Promise<TwoStepEthTransaction<any> | void> => {
    const numTokens: BigNumber = new BigNumber(this.state.numTokens as string);
    return approve(numTokens);
  };

  private deposit = async (): Promise<TwoStepEthTransaction<any> | void> => {
    const numTokens: BigNumber = new BigNumber(this.state.numTokens as string);
    return depositTokens(this.props.listingAddress, numTokens);
  };

  private updateViewState = (event: any): void => {
    const paramName = event.target.getAttribute("name");
    const val = event.target.value;
    const newState = {};
    newState[paramName] = val;
    this.setState(newState);
  };
}
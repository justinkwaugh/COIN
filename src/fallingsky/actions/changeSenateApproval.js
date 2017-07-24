import _ from '../../lib/lodash';
import Action from './action';
import {SenateApprovalStateNames} from 'fallingsky/config/senateApprovalStates';

class ChangeSenateApproval extends Action {

    constructor(args) {
        super(args);

        this.approvalState = args.approvalState;
        this.isFirm = args.isFirm;
        this.oldApprovalState = args.oldApprovalState;
        this.wasFirm = args.wasFirm;
    }

    doExecute(state) {
        this.oldApprovalState = state.romans.senateApprovalState();
        this.wasFirm = state.romans.senateFirm();

        state.romans.senateApprovalState(this.approvalState);
        state.romans.senateFirm(this.isFirm);

        console.log('Changing Senate Approval to ' + this.approvalState + (this.isFirm ? ' Firm' : ''));

    }

    doUndo(state) {
        state.romans.senateApprovalState(this.oldApprovalState);
        state.romans.senateFirm(this.wasFirm);

        console.log('Changing Senate Approval back to ' + this.approvalState + (this.isFirm ? ' Firm' : ''));
    }

    instructions(state) {
        const instructions = [];
        if (this.approvalState !== this.oldApprovalState) {
            instructions.push('Move Senate approval marker to ' + SenateApprovalStateNames[this.approvalState]);
        }

        if (this.isFirm && !this.wasFirm) {
            instructions.push('Flip Senate approval marker to firm');
        }
        else if(!this.isFirm && this.wasFirm) {
            instructions.push('Flip Senate approval marker to normal from firm');
        }
        return instructions;
    }
}

export default ChangeSenateApproval;
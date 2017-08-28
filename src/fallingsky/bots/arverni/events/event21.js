import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import ChangeSenateApproval from 'fallingsky/actions/changeSenateApproval';
import {SenateApprovalStates} from 'fallingsky/config/senateApprovalStates';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import TurnContext from 'common/turnContext';


class Event21 {
    static handleEvent(state) {
        let effective = false;
        if (state.regionsById[RegionIDs.PROVINCIA].controllingFactionId() === FactionIDs.ARVERNI) {
            const currentApprovalState = state.romans.senateApprovalState();
            const currentFirm = state.romans.senateFirm();

            let approvalState = currentApprovalState;
            let isFirm = currentFirm;

            if (currentApprovalState === SenateApprovalStates.UPROAR && currentFirm) {
                return false;
            }
            else if (currentApprovalState === SenateApprovalStates.UPROAR) {
                isFirm = true;
            }
            else if (currentApprovalState === SenateApprovalStates.INTRIGUE) {
                approvalState = SenateApprovalStates.UPROAR;
                isFirm = true;
            }
            else if (currentApprovalState === SenateApprovalStates.ADULATION && currentFirm) {
                approvalState = SenateApprovalStates.INTRIGUE;
                isFirm = false;
            }
            else {
                approvalState -= 2;
            }

            ChangeSenateApproval.execute(state, {
                approvalState,
                isFirm
            });
            effective = true;
        }
        else {
            if (state.arverni.availableWarbands().length > 0) {
                PlaceWarbands.execute(state, {
                    factionId: FactionIDs.ARVERNI,
                    regionId: RegionIDs.PROVINCIA,
                    count: Math.min(4, state.arverni.availableWarbands().length)
                });
            }

            const turn = state.turnHistory.currentTurn;
            turn.pushContext(new TurnContext({
                                                 id: 'e21',
                                                 free: true,
                                                 noEvent: true,
                                                 outOfSequence: true,
                                                 allowedCommands: [CommandIDs.RAID, CommandIDs.BATTLE],
                                                 context: {
                                                     theProvince: true
                                                 }
                                             }));
            const commandAction = state.playersByFaction[FactionIDs.ARVERNI].takeTurn(state);
            if(commandAction) {
                effective = true;
            }
            turn.popContext();
        }
        return effective;
    }
}

export default Event21
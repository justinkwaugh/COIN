import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import TurnContext from 'common/turnContext';
import Battle from 'fallingsky/commands/battle';

class Event2 {
    static handleEvent(state) {

        const targetBattle = _(state.regions).filter(region=>region.getLegions().length > 0 && region.getMobilePiecesForFaction(FactionIDs.BELGAE).length > 0).map(region=> {
            const result = Battle.test(state, {
                                region: region,
                                attackingFactionId: FactionIDs.BELGAE,
                                defendingFactionId: FactionIDs.ROMANS
                            });

            let lossesAgainstLegions = _(result.getNumLossesAgainstPiecesOfType('legion', false)).map('numLosses').sum();
            if(result.mostDefenderLosses() > lossesAgainstLegions) {
                lossesAgainstLegions += 1;
            }

            return {
                result,
                priority : 20 - lossesAgainstLegions
            }
        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

        if(!targetBattle) {
            return false;
        }

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e2',
                                             free: true,
                                             noSpecial: true
                                         }));
        turn.startCommand(CommandIDs.BATTLE);
        targetBattle.result.legiones = true;
        Battle.execute(state, {
            battleResults: targetBattle.result
        });
        turn.commitCommand();
        turn.popContext();

        return true;
    }
}

export default Event2

import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import TurnContext from 'common/turnContext';
import Battle from 'fallingsky/commands/battle';

class Event45 {
    static handleEvent(state) {
        const targetBattle = _(state.regions).filter(region=>region.getLegions().length > 0 && (region.getMobilePiecesForFaction(FactionIDs.BELGAE).length > 0 || region.getMobilePiecesForFaction(FactionIDs.AEDUI).length > 0)).map(region=> {
            const result = Battle.test(state, {
                                region: region,
                                attackingFactionId: FactionIDs.BELGAE,
                                defendingFactionId: FactionIDs.ROMANS,
                                helpingFactionId: FactionIDs.AEDUI
                            });

            let lossesAgainstLegions = _(result.getNumLossesAgainstPiecesOfType('legion', false)).map('numLosses').sum();
            if(lossesAgainstLegions === 0) {
                return;
            }

            return {
                result,
                priority : 20 - lossesAgainstLegions
            }
        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('result').first();

        if(!targetBattle) {
            return false;
        }

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e45',
                                             free: true
                                         }));
        turn.startCommand(CommandIDs.BATTLE);
        if(targetBattle.canAmbush) {
            targetBattle.willAmbush = true;
            turn.startSpecialAbility(SpecialAbilityIDs.AMBUSH);
            turn.commitSpecialAbility();
        }
        Battle.execute(state, {
            battleResults: targetBattle
        });
        turn.commitCommand();
        turn.popContext();

        return true;
    }
}

export default Event45

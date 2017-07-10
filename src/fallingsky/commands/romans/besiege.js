import _ from '../../../lib/lodash';
import Command from '../command';
import BesiegeResults from './besiegeResults';

class Besiege extends Command {

    static doTest(state, args) {
        const battles = args.battles;
        if (!battles) {
            return [];
        }

        return _(battles).map((battle) => {
            if(_.find(battle.attackingPieces, {type : 'legion'}) < 0) {
                return;
            }

            const willRemoveExtraAlly = _.find(battle.getNumLossesAgainstPiecesOfType('alliedtribe'),
                                               {numLosses: 0});
            const willRemoveExtraCitadel = _.find(battle.getNumLossesAgainstPiecesOfType('citadel'),
                                                  citadel => citadel.numLosses < 3);

            if (!willRemoveExtraAlly && !willRemoveExtraCitadel) {
                return;
            }

            return new BesiegeResults({
                battle: battle,
                willRemoveExtraAlly,
                willRemoveExtraCitadel
            });
        }).compact().value();
    }

}

export default Besiege;
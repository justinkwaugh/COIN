import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import EnemyFactionPriority from 'fallingsky/bots/belgae/enemyFactionPriority';
import HidePieces from 'fallingsky/actions/hidePieces';
import TurnContext from 'common/turnContext';
import Battle from 'fallingsky/commands/battle';

class Event36 {
    static handleEvent(state) {
        let effective = false;
        const targetBattles = _(state.regions).filter(
            region => region.getMobilePiecesForFaction(FactionIDs.BELGAE).length > 0).map(region => {
            return _(EnemyFactionPriority).map((factionPriority, factionId) => {
                const result = Battle.test(state, {
                    region: region,
                    attackingFactionId: FactionIDs.BELGAE,
                    defendingFactionId: factionId,
                    shadedMorasses: true
                });

                if(result.defendingPieces.length === 0 || result.mostDefenderLosses() === 0) {
                    return;
                }

                return {
                    battle: result,
                    priority: 99 - result.mostDefenderLosses()
                }

            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('battle').first();
        }).compact().flatten().value();

        const turn = state.turnHistory.currentTurn;

        if (targetBattles.length > 0) {
            const turn = state.turnHistory.currentTurn;
            turn.pushContext(new TurnContext({
                                                 id: 'e2',
                                                 free: true
                                             }));
            turn.startCommand(CommandIDs.BATTLE);

            turn.startSpecialAbility(SpecialAbilityIDs.AMBUSH);
            turn.commitSpecialAbility();

            _.each(targetBattles, battle => {
                battle.willAmbush = true;
                Battle.execute(state, {
                    battleResults: battle
                });
            });

            turn.commitCommand();
            turn.popContext();
            effective = true;
        }


        const targetMarchRegions = _(state.regions).filter(
            region => region.getRevealedPiecesForFaction(FactionIDs.BELGAE).length > 0).value();


        if (targetMarchRegions.length > 0) {
            turn.pushContext(new TurnContext({
                                                 id: 'e2-2',
                                                 free: true,
                                                 noSpecial: true
                                             }));
            turn.startCommand(CommandIDs.MARCH);
            _.each(targetMarchRegions, region => {
                HidePieces.execute(state, {
                    factionId: FactionIDs.BELGAE,
                    regionId: region.id
                })
            });

            turn.commitCommand();
            turn.popContext();
            effective = true;
        }

        return effective;
    }
}

export default Event36

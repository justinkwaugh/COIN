import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import TurnContext from 'common/turnContext';
import MovePieces from 'fallingsky/actions/movePieces';
import HidePieces from 'fallingsky/actions/hidePieces';
import Battle from 'fallingsky/commands/battle';


class Event58 {
    static handleEvent(state) {
        const chosenMarches = _(state.regions).filter(region => region.getFort()).map(region => {
            const germansToMarch = _(region.adjacent).map(adjacent => {
                const warbands = adjacent.getWarbandsOrAuxiliaForFaction(FactionIDs.GERMANIC_TRIBES);
                if (warbands.length === 0) {
                    return;
                }

                return {
                    region: adjacent,
                    warbands,
                    numWarbands: warbands.length
                };
            }).compact().value();

            if (germansToMarch.length === 0) {
                return;
            }

            const totalWarbands = _.reduce(germansToMarch, (sum, marchData) => {
                return sum + marchData.numWarbands;
            }, region.getWarbandsOrAuxiliaForFaction(FactionIDs.GERMANIC_TRIBES).length);

            if (totalWarbands < 2) {
                return;
            }

            return {
                region,
                marches: germansToMarch,
                numWarbands: totalWarbands
            }

        }).compact().shuffle().first();

        if (!chosenMarches) {
            return;
        }

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e58-1',
                                             currentFactionId: FactionIDs.GERMANIC_TRIBES,
                                             free: true,
                                             noEvent: true,
                                             noSpecial: true,
                                             outOfSequence: true
                                         }));
        turn.startCommand(CommandIDs.MARCH);
        _.each(chosenMarches.marches, march => {
            HidePieces.execute(state, {
                factionId: FactionIDs.GERMANIC_TRIBES,
                regionId: march.region.id
            });

            MovePieces.execute(state, {
                sourceRegionId: march.region.id,
                destRegionId: chosenMarches.region.id,
                pieces: march.warbands
            });
        });
        turn.commitCommand();
        turn.popContext();

        const battleResults = Battle.test(
            state, {
                region: chosenMarches.region,
                attackingFactionId: FactionIDs.GERMANIC_TRIBES,
                defendingFactionId: FactionIDs.ROMANS
            });

        battleResults.willAmbush = true;
        battleResults.aduataca = true;

        turn.pushContext(new TurnContext({
                                             id: 'e58-2',
                                             currentFactionId: FactionIDs.GERMANIC_TRIBES,
                                             free: true,
                                             noEvent: true,
                                             noSpecial: true,
                                             outOfSequence: true
                                         }));

        turn.startCommand(CommandIDs.BATTLE);
        turn.startSpecialAbility(SpecialAbilityIDs.AMBUSH);
        turn.commitSpecialAbility();
        Battle.execute(state, {
            battleResults
        });
        turn.commitCommand();
        turn.popContext();

        return true;
    }
}

export default Event58

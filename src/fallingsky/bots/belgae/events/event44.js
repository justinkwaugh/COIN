import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import TurnContext from 'common/turnContext';
import BelgaeRaid from 'fallingsky/bots/belgae/belgaeRaid';
import RemovePieces from 'fallingsky/actions/removePieces';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';

class Event44 {
    static handleEvent(state) {

        let numToReplace = 3;
        let replacements = _(state.regions).map(region => {

            if (numToReplace === 0) {
                return;
            }

            const auxilia = _(region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS)).sortBy(
                piece => (piece.revealed() ? 'b' : 'a')).take(numToReplace).value();
            if (auxilia.length === 0) {
                return;
            }

            numToReplace -= auxilia.length;

            return {
                factionId: FactionIDs.ROMANS,
                regionId: region.id,
                pieces: auxilia
            }
        }).compact().value();

        if (numToReplace > 0) {
            const aeduiReplacements = _(state.regions).map(region => {
                if (numToReplace === 0) {
                    return;
                }

                const warbands = _(region.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI)).sortBy(
                    piece => (piece.scouted() ? 'c' : piece.revealed() ? 'b' : 'a')).take(numToReplace).value();
                if (warbands.length === 0) {
                    return;
                }

                numToReplace -= warbands.length;

                return {
                    factionId: FactionIDs.AEDUI,
                    regionId: region.id,
                    pieces: warbands
                }
            }).compact().value();

            replacements = replacements.concat(aeduiReplacements);
        }

        if (replacements.length === 0) {
            return false;
        }

        // Otherwise forced to place other faction warbands to satisfy card.
        if(state.belgae.availableWarbands().length < replacements.length && (state.romans.hasAvailableWarbands(1) ||
                                                                             state.aedui.hasAvailableWarbands(1) ||
                                                                             state.romans.arverni.hasAvailableWarbands(1) ||
                                                                             state.germanic.hasAvailableWarbands(1))) {
            return false;
        }

        const warbandsPerRegion = {};

        _.each(replacements, replacement => {
            RemovePieces.execute(state, replacement);

            const numToAdd = Math.min(replacement.length, state.belgae.availableWarbands().length);
            if (numToAdd > 0) {
                PlaceWarbands.execute(state, {
                    factionId: FactionIDs.BELGAE,
                    regionId: replacement.regionId,
                    count: numToAdd
                });
                warbandsPerRegion[regionId] = numToAdd;
            }
        });

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e44',
                                             free: true,
                                             noSpecial: true,
                                             allowedRegions: _.map(replacements, 'regionId'),
                                             context: { warbandsPerRegion }
                                         }));
        BelgaeRaid.raid(state, turn.getContext());
        turn.popContext();



        return true;
    }

}

export default Event44

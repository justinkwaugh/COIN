import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import TurnContext from 'common/turnContext';
import ArverniRaid from 'fallingsky/bots/arverni/arverniRaid';
import RemovePieces from 'fallingsky/actions/removePieces';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';

class Event44 {
    static handleEvent(state) {
        if (state.arverni.availableWarbands().length < Math.min(3,
                                                                state.romans.numPlacedAuxilia() + state.romans.numPlacedWarbands())) {
            return false;
        }

        let numToReplace = 3;
        const warbandsPerRegion = {};

        const legionRegionData = _(state.regions).shuffle().map(region => {
            const hasLegions = region.getLegions().length > 0;
            const numAuxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length;

            if (!hasLegions || numAuxilia === 0) {
                return;
            }

            return {
                region,
                numAuxilia
            }
        }).compact().sortBy('numAuxilia').value();

        _.each(legionRegionData, regionData => {
            if (regionData.numAuxilia > numToReplace || regionData.numAuxilia > state.arverni.availableWarbands().length) {
                return false;
            }

            const auxilia = regionData.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
            RemovePieces.execute(state, {
                factionId: FactionIDs.ROMANS,
                regionId: regionData.region.id,
                pieces: auxilia
            });

            PlaceWarbands.execute(state, {
                factionId: FactionIDs.ARVERNI,
                regionId: regionData.region.id,
                count: regionData.numAuxilia
            });
            warbandsPerRegion[regionData.region.id] = regionData.numAuxilia;

            numToReplace -= auxilia.length;
        });

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


        _.each(replacements, replacement => {
            RemovePieces.execute(state, replacement);

            const numToAdd = Math.min(replacement.length, state.arverni.availableWarbands().length);
            if (numToAdd > 0) {
                PlaceWarbands.execute(state, {
                    factionId: FactionIDs.ARVERNI,
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
                                             context: {warbandsPerRegion}
                                         }));
        ArverniRaid.raid(state, turn.getContext());
        turn.popContext();


        return true;
    }

}

export default Event44

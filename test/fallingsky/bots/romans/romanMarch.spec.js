import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLegions from 'fallingsky/actions/placeLegions'
import RevealPieces from 'fallingsky/actions/revealPieces'
import RomanMarch from 'fallingsky/bots/romans/romanMarch';
import TurnContext from 'common/turnContext';

describe("Roman march", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
        state.turnHistory.startTurn(romans.id);
    });

    it('simply marches to consolidate legions', function () {
        romans.setResources(20);

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceLeader.execute(state, { factionId: romans.id, regionId: treveriRegion.id});
        PlaceLegions.execute(state, { factionId: romans.id, regionId: treveriRegion.id, count: 3});

        PlaceLeader.execute(state, { factionId: belgae.id, regionId: treveriRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: treveriRegion.id, count: 12});

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceLegions.execute(state, { factionId: romans.id, regionId: arverniRegion.id, count: 3});
        PlaceAuxilia.execute(state, { factionId: romans.id, regionId: arverniRegion.id, count: 3});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, tribeId: TribeIDs.PICTONES});

        const command = RomanMarch.march(state, new TurnContext({noSpecial: true}));
        command.should.equal(FactionActions.COMMAND);
        expect(romans.resources()).to.equal(16);
        expect(pictonesRegion.getLegions().length).to.equal(6);
        expect(pictonesRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(3);
        expect(arverniRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(arverniRegion.controllingFactionId()).to.be.null;

    });
});
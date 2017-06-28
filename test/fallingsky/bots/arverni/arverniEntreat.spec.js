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
import ArverniEntreat from 'fallingsky/bots/arverni/arverniEntreat';
import CommandModifier from 'fallingsky/commands/commandModifiers';

describe("Arverni entreat", function () {
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
        state.turnHistory.startTurn(arverni.id);
    });

    it('replaces aedui, belgic, germanic, preferring city', function () {
        arverni.setResources(20);

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: atrebatesRegion.id, count: 3});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.ATREBATES});
        PlaceAlliedTribe.execute(state, {factionId: germanic.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.BELLOVACI});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: treveriRegion.id, count: 3});
        PlaceAlliedTribe.execute(state, {factionId: germanic.id, regionId: treveriRegion.id, tribeId: TribeIDs.TREVERI});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: biturigesRegion.id, count: 3});
        PlaceAlliedTribe.execute(state, {factionId: romans.id, regionId: biturigesRegion.id, tribeId: TribeIDs.BITURIGES});

        expect(ArverniEntreat.entreat(state, new CommandModifier())).to.equal(true);

        let alliedTribe = mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.MANDUBII);

        alliedTribe = atrebatesRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.ATREBATES);

        alliedTribe = treveriRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.TREVERI);
        expect(arverni.resources()).to.equal(17);
    });

    it('replaces allies only if control else warbands', function () {
        arverni.setResources(20);

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 8});
        PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 3});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: atrebatesRegion.id, count: 2});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.ATREBATES});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: atrebatesRegion.id, count: 1});

        expect(ArverniEntreat.entreat(state, new CommandModifier())).to.equal(true);

        let alliedTribe = mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.MANDUBII);
        expect(mandubiiRegion.getMobilePiecesForFaction(FactionIDs.AEDUI).length).to.equal(3);

        expect(atrebatesRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(3);

        expect(arverni.resources()).to.equal(18);
    });

    it('only replaces aedui warbands and roman auxilia', function () {
        arverni.setResources(20);

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, count: 1});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 1});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: atrebatesRegion.id, count: 1});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: atrebatesRegion.id, count: 1});

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: aeduiRegion.id, count: 1});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: aeduiRegion.id, count: 1});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: biturigesRegion.id, count: 1});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: biturigesRegion.id, count: 1});

        expect(ArverniEntreat.entreat(state, new CommandModifier())).to.equal(true);

        expect(mandubiiRegion.getMobilePiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(mandubiiRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(3);

        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(2);

        expect(aeduiRegion.getMobilePiecesForFaction(FactionIDs.BELGAE).length).to.equal(1);
        expect(aeduiRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(1);

        expect(biturigesRegion.getMobilePiecesForFaction(FactionIDs.GERMANIC_TRIBES).length).to.equal(1);
        expect(biturigesRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(1);

        expect(arverni.resources()).to.equal(18);
    });
});
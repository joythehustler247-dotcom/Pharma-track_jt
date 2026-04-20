import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PharmaTrack", function () {
  // ── Fixture ───────────────────────────────────────────────────────────────

  async function deployFixture() {
    const [admin, manufacturer, distributor, pharmacy, attacker] =
      await ethers.getSigners();

    const PharmaTrack = await ethers.getContractFactory("PharmaTrack");
    const contract = await PharmaTrack.deploy();
    await contract.waitForDeployment();

    // Role bytes32
    const MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER"));
    const DISTRIBUTOR_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR"));
    const PHARMACY_ROLE     = ethers.keccak256(ethers.toUtf8Bytes("PHARMACY"));
    const DEFAULT_ADMIN     = ethers.ZeroHash; // 0x0000...

    // Assign roles
    await contract.assignRole(manufacturer.address, MANUFACTURER_ROLE);
    await contract.assignRole(distributor.address, DISTRIBUTOR_ROLE);
    await contract.assignRole(pharmacy.address, PHARMACY_ROLE);

    // Test data
    const batchNumber   = "BATCH-001";
    const batchId       = ethers.id(batchNumber);
    const medicineName  = "Paracetamol 500mg";
    const twoYearsLater = Math.floor(Date.now() / 1000) + 2 * 365 * 24 * 60 * 60;
    const totalStrips   = 5;
    const tabletsPerStrip = 10;

    return {
      contract,
      admin, manufacturer, distributor, pharmacy, attacker,
      MANUFACTURER_ROLE, DISTRIBUTOR_ROLE, PHARMACY_ROLE, DEFAULT_ADMIN,
      batchId, medicineName, twoYearsLater, totalStrips, tabletsPerStrip, batchNumber,
    };
  }

  // Helper: register a batch and all strips
  async function registerBatchAndStrips(fixture: Awaited<ReturnType<typeof deployFixture>>) {
    const { contract, manufacturer, batchId, medicineName, twoYearsLater, totalStrips, tabletsPerStrip } = fixture;

    await contract.connect(manufacturer).registerBatch(
      batchId, medicineName, twoYearsLater, totalStrips
    );

    const stripIds: string[] = [];
    for (let i = 1; i <= totalStrips; i++) {
      const stripId = ethers.id(`${batchId}-strip-${i}`);
      stripIds.push(stripId);
      await contract.connect(manufacturer).registerStrip(
        stripId, batchId, i, tabletsPerStrip
      );
    }

    return stripIds;
  }

  // Helper: full supply chain up to pharmacy holding the strips
  async function fullSupplyChain(fixture: Awaited<ReturnType<typeof deployFixture>>) {
    const { contract, manufacturer, distributor, pharmacy, batchId } = fixture;
    const stripIds = await registerBatchAndStrips(fixture);

    await contract.connect(manufacturer).transferToDistributor(batchId, distributor.address);
    await contract.connect(distributor).transferToPharmacy(batchId, pharmacy.address);

    return stripIds;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // HAPPY PATH TESTS
  // ────────────────────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("1. Deployer gets DEFAULT_ADMIN_ROLE", async function () {
      const { contract, admin, DEFAULT_ADMIN } = await loadFixture(deployFixture);
      expect(await contract.hasRole(DEFAULT_ADMIN, admin.address)).to.be.true;
    });
  });

  describe("Role Assignment", function () {
    it("2. Admin can assign MANUFACTURER_ROLE", async function () {
      const { contract, manufacturer, MANUFACTURER_ROLE } = await loadFixture(deployFixture);
      expect(await contract.hasRole(MANUFACTURER_ROLE, manufacturer.address)).to.be.true;
    });

    it("3. Admin can assign DISTRIBUTOR_ROLE", async function () {
      const { contract, distributor, DISTRIBUTOR_ROLE } = await loadFixture(deployFixture);
      expect(await contract.hasRole(DISTRIBUTOR_ROLE, distributor.address)).to.be.true;
    });

    it("4. Admin can assign PHARMACY_ROLE", async function () {
      const { contract, pharmacy, PHARMACY_ROLE } = await loadFixture(deployFixture);
      expect(await contract.hasRole(PHARMACY_ROLE, pharmacy.address)).to.be.true;
    });
  });

  describe("Batch Registration", function () {
    it("5. Manufacturer can register a batch", async function () {
      const { contract, manufacturer, batchId, medicineName, twoYearsLater, totalStrips } =
        await loadFixture(deployFixture);

      const tx = await contract.connect(manufacturer).registerBatch(
        batchId, medicineName, twoYearsLater, totalStrips
      );

      await expect(tx)
        .to.emit(contract, "BatchRegistered")
        .withArgs(batchId, manufacturer.address, (v: any) => v > 0);

      const batch = await contract.batches(batchId);
      expect(batch.medicineName).to.equal(medicineName);
      expect(batch.manufacturer).to.equal(manufacturer.address);
      expect(batch.totalStrips).to.equal(totalStrips);
      expect(batch.isActive).to.be.true;
    });

    it("6. Registering duplicate batch reverts with BatchAlreadyExists", async function () {
      const { contract, manufacturer, batchId, medicineName, twoYearsLater, totalStrips } =
        await loadFixture(deployFixture);

      await contract.connect(manufacturer).registerBatch(
        batchId, medicineName, twoYearsLater, totalStrips
      );

      await expect(
        contract.connect(manufacturer).registerBatch(
          batchId, medicineName, twoYearsLater, totalStrips
        )
      ).to.be.revertedWithCustomError(contract, "BatchAlreadyExists");
    });
  });

  describe("Strip Registration", function () {
    it("7. Manufacturer can register strips for a batch", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, manufacturer, batchId, medicineName, twoYearsLater, totalStrips, tabletsPerStrip } = fixture;

      await contract.connect(manufacturer).registerBatch(
        batchId, medicineName, twoYearsLater, totalStrips
      );

      const stripId = ethers.id(`${batchId}-strip-1`);
      const tx = await contract.connect(manufacturer).registerStrip(
        stripId, batchId, 1, tabletsPerStrip
      );

      await expect(tx)
        .to.emit(contract, "StripRegistered")
        .withArgs(stripId, batchId, 1);

      const strip = await contract.strips(stripId);
      expect(strip.tabletsTotal).to.equal(tabletsPerStrip);
      expect(strip.tabletsRemaining).to.equal(tabletsPerStrip);
      expect(strip.currentHolder).to.equal(manufacturer.address);
      expect(strip.isActive).to.be.true;
    });

    it("8. Registering duplicate strip reverts with StripAlreadyExists", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, manufacturer, batchId, medicineName, twoYearsLater, totalStrips, tabletsPerStrip } = fixture;

      await contract.connect(manufacturer).registerBatch(
        batchId, medicineName, twoYearsLater, totalStrips
      );

      const stripId = ethers.id(`${batchId}-strip-1`);
      await contract.connect(manufacturer).registerStrip(stripId, batchId, 1, tabletsPerStrip);

      await expect(
        contract.connect(manufacturer).registerStrip(stripId, batchId, 1, tabletsPerStrip)
      ).to.be.revertedWithCustomError(contract, "StripAlreadyExists");
    });
  });

  describe("Transfers", function () {
    it("9. Manufacturer can transfer batch to distributor", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, manufacturer, distributor, batchId } = fixture;
      const stripIds = await registerBatchAndStrips(fixture);

      const tx = await contract.connect(manufacturer).transferToDistributor(
        batchId, distributor.address
      );

      await expect(tx)
        .to.emit(contract, "BatchTransferred")
        .withArgs(batchId, manufacturer.address, distributor.address, "DISTRIBUTOR");

      // Verify strip holders updated
      for (const sid of stripIds) {
        const strip = await contract.strips(sid);
        expect(strip.currentHolder).to.equal(distributor.address);
      }
    });

    it("10. Distributor can transfer batch to pharmacy", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, manufacturer, distributor, pharmacy, batchId } = fixture;
      await registerBatchAndStrips(fixture);

      await contract.connect(manufacturer).transferToDistributor(batchId, distributor.address);

      const tx = await contract.connect(distributor).transferToPharmacy(
        batchId, pharmacy.address
      );

      await expect(tx)
        .to.emit(contract, "BatchTransferred")
        .withArgs(batchId, distributor.address, pharmacy.address, "PHARMACY");
    });
  });

  describe("Sale Tokens", function () {
    it("11. Pharmacy can generate a sale token for a full strip (10 tablets)", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, pharmacy, tabletsPerStrip } = fixture;
      const stripIds = await fullSupplyChain(fixture);
      const stripId = stripIds[0]!;

      const tx = await contract.connect(pharmacy).generateSaleToken(stripId, tabletsPerStrip);
      const receipt = await tx.wait();

      // Check SaleTokenCreated event
      const event = receipt?.logs.find((log) => {
        try {
          return contract.interface.parseLog({ topics: [...log.topics], data: log.data })?.name === "SaleTokenCreated";
        } catch { return false; }
      });
      expect(event).to.not.be.undefined;

      // Strip should be fully sold
      const strip = await contract.strips(stripId);
      expect(strip.tabletsRemaining).to.equal(0);
      expect(strip.isActive).to.be.false;
    });

    it("12. Pharmacy can generate a sale token for partial strip (6 of 10)", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, pharmacy } = fixture;
      const stripIds = await fullSupplyChain(fixture);
      const stripId = stripIds[0]!;

      await contract.connect(pharmacy).generateSaleToken(stripId, 6);

      const strip = await contract.strips(stripId);
      expect(strip.tabletsRemaining).to.equal(4);
      expect(strip.isActive).to.be.true;
    });

    it("13. tabletsRemaining decreases correctly after each sale", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, pharmacy } = fixture;
      const stripIds = await fullSupplyChain(fixture);
      const stripId = stripIds[0]!;

      await contract.connect(pharmacy).generateSaleToken(stripId, 3);
      let strip = await contract.strips(stripId);
      expect(strip.tabletsRemaining).to.equal(7);

      await contract.connect(pharmacy).generateSaleToken(stripId, 4);
      strip = await contract.strips(stripId);
      expect(strip.tabletsRemaining).to.equal(3);

      await contract.connect(pharmacy).generateSaleToken(stripId, 3);
      strip = await contract.strips(stripId);
      expect(strip.tabletsRemaining).to.equal(0);
    });

    it("14. Strip becomes inactive when tabletsRemaining reaches 0", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, pharmacy, tabletsPerStrip } = fixture;
      const stripIds = await fullSupplyChain(fixture);
      const stripId = stripIds[0]!;

      await contract.connect(pharmacy).generateSaleToken(stripId, tabletsPerStrip);

      const strip = await contract.strips(stripId);
      expect(strip.isActive).to.be.false;
      expect(strip.tabletsRemaining).to.equal(0);
    });
  });

  describe("Verification", function () {
    it("15. verifyToken returns correct SaleToken, Strip, Batch data", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, pharmacy, manufacturer, batchId, medicineName, totalStrips } = fixture;
      const stripIds = await fullSupplyChain(fixture);
      const stripId = stripIds[0]!;

      const tx = await contract.connect(pharmacy).generateSaleToken(stripId, 6);
      const receipt = await tx.wait();

      // Parse the SaleTokenCreated event to get tokenId
      let tokenId: string = "";
      for (const log of receipt!.logs) {
        try {
          const parsed = contract.interface.parseLog({ topics: [...log.topics], data: log.data });
          if (parsed?.name === "SaleTokenCreated") {
            tokenId = parsed.args[0];
            break;
          }
        } catch {}
      }
      expect(tokenId).to.not.equal("");

      const [saleToken, strip, batch] = await contract.verifyToken(tokenId);

      // SaleToken
      expect(saleToken.tokenId).to.equal(tokenId);
      expect(saleToken.stripId).to.equal(stripId);
      expect(saleToken.pharmacy).to.equal(pharmacy.address);
      expect(saleToken.tabletsSold).to.equal(6);

      // Strip
      expect(strip.stripId).to.equal(stripId);
      expect(strip.batchId).to.equal(batchId);
      expect(strip.tabletsTotal).to.equal(10);
      expect(strip.tabletsRemaining).to.equal(4);

      // Batch
      expect(batch.batchId).to.equal(batchId);
      expect(batch.medicineName).to.equal(medicineName);
      expect(batch.manufacturer).to.equal(manufacturer.address);
      expect(batch.totalStrips).to.equal(totalStrips);
      expect(batch.isActive).to.be.true;
    });

    it("16. verifyToken on non-existent token reverts with TokenNotFound", async function () {
      const { contract } = await loadFixture(deployFixture);
      const fakeTokenId = ethers.id("non-existent-token");

      await expect(contract.verifyToken(fakeTokenId))
        .to.be.revertedWithCustomError(contract, "TokenNotFound");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // ACCESS CONTROL TESTS
  // ────────────────────────────────────────────────────────────────────────────

  describe("Access Control", function () {
    it("17. Non-manufacturer cannot call registerBatch", async function () {
      const { contract, attacker, batchId, medicineName, twoYearsLater, totalStrips } =
        await loadFixture(deployFixture);

      await expect(
        contract.connect(attacker).registerBatch(batchId, medicineName, twoYearsLater, totalStrips)
      ).to.be.reverted;
    });

    it("18. Non-distributor cannot call transferToPharmacy", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, manufacturer, pharmacy, batchId } = fixture;
      await registerBatchAndStrips(fixture);
      await contract.connect(manufacturer).transferToDistributor(batchId, fixture.distributor.address);

      // manufacturer tries to call transferToPharmacy — should fail
      await expect(
        contract.connect(manufacturer).transferToPharmacy(batchId, pharmacy.address)
      ).to.be.reverted;
    });

    it("19. Non-pharmacy cannot call generateSaleToken", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, distributor } = fixture;
      const stripIds = await fullSupplyChain(fixture);

      await expect(
        contract.connect(distributor).generateSaleToken(stripIds[0]!, 5)
      ).to.be.reverted;
    });

    it("20. Pharmacy cannot sell more tablets than remaining (InsufficientTablets)", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, pharmacy } = fixture;
      const stripIds = await fullSupplyChain(fixture);

      await expect(
        contract.connect(pharmacy).generateSaleToken(stripIds[0]!, 11)
      ).to.be.revertedWithCustomError(contract, "InsufficientTablets");
    });

    it("21. Pharmacy cannot sell from a strip they don't hold (NotStripHolder)", async function () {
      const fixture = await loadFixture(deployFixture);
      const { contract, pharmacy, manufacturer } = fixture;

      // Register batch and strips but DON'T transfer — manufacturer still holds them
      await registerBatchAndStrips(fixture);

      // pharmacy tries to sell from strip still held by manufacturer
      const stripId = ethers.id(`${fixture.batchId}-strip-1`);
      await expect(
        contract.connect(pharmacy).generateSaleToken(stripId, 5)
      ).to.be.revertedWithCustomError(contract, "NotStripHolder");
    });

    it("22. Cannot register batch with expiry in the past (ExpiryInPast)", async function () {
      const { contract, manufacturer, batchId, medicineName, totalStrips } =
        await loadFixture(deployFixture);

      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      await expect(
        contract.connect(manufacturer).registerBatch(batchId, medicineName, pastTimestamp, totalStrips)
      ).to.be.revertedWithCustomError(contract, "ExpiryInPast");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // PAUSE TESTS
  // ────────────────────────────────────────────────────────────────────────────

  describe("Pause Functionality", function () {
    it("23. Admin can pause the contract", async function () {
      const { contract, admin } = await loadFixture(deployFixture);
      await contract.connect(admin).pause();
      expect(await contract.paused()).to.be.true;
    });

    it("24. No state-changing function works when paused", async function () {
      const { contract, admin, manufacturer, batchId, medicineName, twoYearsLater, totalStrips } =
        await loadFixture(deployFixture);

      await contract.connect(admin).pause();

      await expect(
        contract.connect(manufacturer).registerBatch(batchId, medicineName, twoYearsLater, totalStrips)
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");
    });

    it("25. Admin can unpause and functions work again", async function () {
      const { contract, admin, manufacturer, batchId, medicineName, twoYearsLater, totalStrips } =
        await loadFixture(deployFixture);

      await contract.connect(admin).pause();
      await contract.connect(admin).unpause();

      // Should succeed now
      await expect(
        contract.connect(manufacturer).registerBatch(batchId, medicineName, twoYearsLater, totalStrips)
      ).to.not.be.reverted;
    });
  });
});

# Releasing Oriel TV

A release starts with a version tag. The [release workflow](../.github/workflows/release.yml) checks that the versions match the tag, runs the tests and license checks, builds every file, adds checksums and build provenance, and opens a **draft** release. A maintainer reviews the draft and publishes it. Nothing is published automatically.

## What a release contains

| File | Built on | Notes |
| --- | --- | --- |
| `oriel-launcher-<version>.apk` | Linux | The launcher, signed with the project's release key. |
| `oriel-control-center_<version>-1_amd64.deb` | Linux | Control Center for Debian and Ubuntu, with its own Java runtime. |
| `oriel-control-center-<version>.msi` | Windows | Control Center for Windows, with its own Java runtime. |
| `oriel-control-center-macos-<arch>-<version>.jar` | macOS | Run with `java -jar` (Java 17 or newer). A macOS installer needs Apple signing and notarization first. |
| `SHA256SUMS.txt` | Linux | SHA-256 checksums for every file above. |

Every file also gets a [build provenance attestation](https://docs.github.com/actions/security-for-github-actions/using-artifact-attestations), so anyone can confirm it was built from this repository by this workflow:

```bash
gh attestation verify oriel-launcher-0.1.0.apk --repo vishwavinoth/oriel-tv
```

## One-time setup: the signing key

Android only installs signed APKs, and every update must be signed with the same key. Losing the key means users can't update without uninstalling, so create it once and back it up somewhere offline.

```bash
keytool -genkeypair -v -keystore oriel-release.jks -alias oriel -keyalg RSA -keysize 4096 -validity 10000
```

Then add four repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `ORIEL_KEYSTORE_BASE64` | The keystore file, base64-encoded (`base64 -w0 oriel-release.jks`). |
| `ORIEL_KEYSTORE_PASSWORD` | The keystore password. |
| `ORIEL_KEY_ALIAS` | The key alias, for example `oriel`. |
| `ORIEL_KEY_PASSWORD` | The key password. |

The key never goes into the repository. The workflow decodes it into the runner's temporary folder and deletes it afterwards. Without these secrets the workflow still runs, but the draft's APK is unsigned and marked "Don't publish".

## Checklist

1. **Versions.** Set the same version in `launcher/build.gradle.kts` (`versionName`, and raise `versionCode` by one) and `control-center/build.gradle.kts` (`packageVersion`). Drop any `-dev` suffix.
2. **Changelog.** Rename the "Unreleased" section to `## [x.y.z] - YYYY-MM-DD`, exactly in that form, and start a new empty "Unreleased" section above it. Include supported platforms and known limitations (PRD section 9.4).
3. **Compatibility.** Update `website/src/data/compatibility.ts` only with devices someone actually tested, and say who tested what, on which software version.
4. **Checks.** Run everything CI runs:

   ```bash
   ./gradlew :shared:device:test :shared:device:licensee :control-center:test :control-center:licensee :launcher:testDebugUnitTest :launcher:licenseeRelease :launcher:lintDebug :launcher:assembleRelease
   cd website && npm ci && npm run check:licenses && npm run lint && npm run typecheck && npm test && npm run build && npm run check:routes
   ```

5. **Tag.** Merge to `main`, then tag the merge commit `vX.Y.Z` and push the tag, either with `git tag vX.Y.Z && git push origin vX.Y.Z` or from GitHub Desktop (**History**, right-click the commit, **Create Tag**, then **Push**).
6. **Review the draft.** When the workflow finishes, open the draft on the Releases page. Check that every file is there, that `SHA256SUMS.txt` matches, and that the notes are right. Add which devices this release was tested on, and never list a device nobody tested.
7. **Publish.** Publish the draft, then confirm the website's Downloads page points at it.

## Known blockers before the first public release

- A release signing key and its secrets (above).
- Testing on at least one physical Android TV or Google TV device (PRD sections 9.4 and 13).
- The name and trademark check in PRD section 4.1, before the repository goes public.

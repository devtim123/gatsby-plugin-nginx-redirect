import { onPostBuild } from "./gatsby-node";
import { pathExists, remove, readFile } from "fs-extra";

describe("gatsby-node", () => {
  describe("onPostBuild", () => {
    let redirects = [];
    let reporterMock = {
      warn: jest.fn(),
    };
    let storeMock = {
      getState: jest.fn().mockReturnValue({
        redirects,
      }),
    };
    const options = {
      inputConfigFile: `${__dirname}/sampleNginx.conf`,
      outputConfigFile: `${__dirname}/sampleNginx.out.conf`,
    };

    beforeEach(async () => {
      await remove(options.outputConfigFile);
      redirects = [];
      storeMock = {
        getState: jest.fn().mockReturnValue({
          redirects,
        }),
      };
    });

    afterEach(async () => {
      await remove(options.outputConfigFile);
    });

    it("should generate an out file", async () => {
      await onPostBuild(
        {
          reporter: reporterMock,
          store: storeMock,
        },
        options
      );

      expect(await pathExists(options.outputConfigFile)).toBe(true);
    });

    it("should add redirect to file out file", async () => {
      const redirects = [
        { fromPath: "/hello", toPath: "/world", isPermanent: true },
      ];
      storeMock.getState.mockReturnValue({ redirects });

      await onPostBuild(
        {
          reporter: reporterMock,
          store: storeMock,
        },
        options
      );

      redirects.forEach(async (redirect) => {
        expect(await readFile(options.outputConfigFile, "utf-8")).toContain(
          `rewrite ^${redirect.fromPath}\\/?$ ${redirect.toPath} permanent;`
        );
      });
    });
  });
});

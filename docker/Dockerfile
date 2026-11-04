#
# 模拟「一台干净的机器」：只有 Node、基础 Unix 工具，非 root 用户。
# 离线套件在运行前生成 fixture 上游缓存，全程不访问网络。

ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE}

ARG WITH_GIT=true
ARG VERIFY_UID=1001
ARG VERIFY_GID=1001

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false \
    REPO_ROOT=/opt/selected-skills \
    VERIFY_ROOT=/opt/verify \
    PATH=/opt/verify/fakebin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN apt-get update \
 && apt-get install -y --no-install-recommends bash ca-certificates passwd tar which \
 && if [ "$WITH_GIT" = "true" ]; then apt-get install -y --no-install-recommends git; fi \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid "$VERIFY_GID" verify \
 && useradd --uid "$VERIFY_UID" --gid "$VERIFY_GID" --create-home --shell /bin/bash verify

# 被测项目本体（版本化进镜像，保证 CI 与本地一致）
COPY --chown=verify:verify package.json LICENSE README.md install.sh "$REPO_ROOT"/
COPY --chown=verify:verify tools "$REPO_ROOT"/tools
COPY --chown=verify:verify skills "$REPO_ROOT"/skills
COPY --chown=verify:verify scenarios "$REPO_ROOT"/scenarios

# 验证框架（入口、套件、断言库）
COPY --chown=verify:verify docker/verify "$VERIFY_ROOT"

# 模拟已安装的 Agent 平台二进制，让 detectPlatforms() 能看到全部九个平台
RUN mkdir -p "$VERIFY_ROOT/fakebin" \
 && for bin in claude codex pi opencode cursor grok gemini openclaw hermes; do \
      printf '#!/bin/sh\nexit 0\n' > "$VERIFY_ROOT/fakebin/$bin"; \
      chmod 0755 "$VERIFY_ROOT/fakebin/$bin"; \
    done \
 && chmod 0755 "$VERIFY_ROOT/entrypoint.sh" \
 && chmod 0755 "$VERIFY_ROOT"/suites/*.sh \
 && chown -R verify:verify "$VERIFY_ROOT"

USER verify
WORKDIR /opt/verify
ENTRYPOINT ["/opt/verify/entrypoint.sh"]
CMD ["offline"]

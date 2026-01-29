# git_deploy_helper.py
# Netlify(깃) 배포용 헬퍼 스크립트(플레이스홀더)
# 목적: 로컬 빌드, netlify CLI 배포, 또는 깃 푸시 전 검사 자동화 스텁

import subprocess
import sys

def run(cmd):
    print('> ' + ' '.join(cmd))
    subprocess.run(cmd, check=True)

if __name__ == '__main__':
    # 예: python git_deploy_helper.py build-deploy
    if len(sys.argv) >= 2 and sys.argv[1] == 'build-deploy':
        # 빌드 스텁 (있다면 npm run build)
        try:
            run(['npm','run','build'])
        except Exception:
            print('빌드 스크립트 없음, 계속 진행')
        # netlify deploy (사용자는 netlify-cli 로그인 필요)
        try:
            run(['npx','netlify','deploy','--prod','--dir','.'])
        except Exception as e:
            print('Netlify 배포 실패:', e)
    else:
        print('Usage: python git_deploy_helper.py build-deploy')
